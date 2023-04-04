// App.js
// フロントエンドを構築する上で必要なファイルやライブラリをインポートする
import React, { Component } from 'react'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {
  // componentWillMount(): 主にサーバーへのAPIコールを行うなど、実際のレンダリングが行われる前にサーバーサイドのロジックを実装するために使用。
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }
  // loadBlockchainData(): ブロックチェーン上のデータとやり取りするための関数
  // MetaMask との接続によって得られた情報とコントラクトとの情報を使って描画に使う情報を取得。
  async loadBlockchainData() {
    const web3 = window.web3
        // ユーザーの Metamask の一番最初のアカウント（複数アカウントが存在する場合）取得
    const accounts = await web3.eth.getAccounts()
    // ユーザーの Metamask アカウントを設定
    // この機能により、App.js に記載されている constructor() 内の account（デフォルト: '0x0'）が更新される
    this.setState({ account: accounts[0]})
        // ユーザーが Metamask を介して接続しているネットワークIDを取得
    const networkId = await web3.eth.net.getId()
        // DaiToken のデータを取得
    const daiTokenData = DaiToken.networks[networkId]
    if(daiTokenData){
          // DaiToken の情報を daiToken に格納する
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
          // constructor() 内の daiToken の情報を更新する
      this.setState({daiToken})

      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()

      this.setState({daiTokenBalance: daiTokenBalance.toString()})

      console.log(daiTokenBalance.toString())
    }else{
      window.alert('DaiToken contract not deployed to detected network.')
    }
    // 1 add code 
    const dappTokenData = DappToken.networks[networkId]
    if (dappTokenData) {

      const dappToken = new web3.eth.Contract(DaiToken.abi, dappTokenData.address)

      this.setState({ dappToken})

      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call()

      this.setState({ dappTokenBalance: dappTokenBalance.toString() })

      console.log(dappTokenBalance.toString())
    } else {
      window.alert('DappToken contract not deployed to detected network.')
    }
  //tokenFarmData get
    const tokenFarmData = TokenFarm.networks[networkId]
    if (tokenFarmData) {

      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)

      this.setState({ tokenFarm})

      let tokenFarmBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()

      this.setState({ stakingBalance: tokenFarmBalance.toString() })

      console.log(tokenFarmBalance.toString())
    } else {
      window.alert('TokenFarm contract not deployed to detected network.')
    }
    //1 add code end
  }
  //loadWeb3(): metamask check
  async loadWeb3() {

    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } 
    //don't have metamask return error
    else {
      window.alert('Non ethereum browser detected. You should consider trying to install metamask')
    }
    this.setState({ loading: false})
  }
  //2 add code
  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  } 

  unstakeToken = (amount) => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.unstakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }
  //2 add code end
  // constructor(): refresh function 
  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }
  //frontend rendering do
  render() {

    //render add
    let content
    if (this.state.loading) {
      content = <p id='loader' className='text-center'>Loading...</p>
    } else {
      content = <Main
      daiTokenBalance={this.state.daiTokenBalance}
      dappTokenBalance={this.state.dappTokenBalance}
      stakingBalance={this.state.stakingBalance}
      stakeTokens={this.stakeTokens}
      unstakeTokens={this.unstakeTokens}
      />
    }

    //render add end
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="https://unchain-portal.netlify.app/home"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}
                
                <h1>Hello, World!</h1>

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
