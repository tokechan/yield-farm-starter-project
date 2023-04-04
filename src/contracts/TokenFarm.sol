// TokenFarm.sol
pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./MockDaiToken.sol";

contract TokenFarm{
    string public name = "Dapp Token Farm";
    address public owner;
    DappToken public dappToken;
    DaiToken public daiToken;

    //7
    address[] public stakers;
    //4
    mapping (address => uint) public stakingBalance;
    //6
    mapping (address => bool) public hasStaked;
    //10
    mapping (address => bool) public isStaking;
    constructor(DappToken _dappToken, DaiToken _daiToken)public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    //1
    function stakeTokens(uint _amount) public {
        //2
        require(_amount > 0, "amount can't be 0");
        //3
        daiToken.transferFrom(msg.sender, address(this), _amount);

        //5 
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;
        //8
        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }
        //9
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }
        // ----- 追加する機能 ------ //
    //2.トークンの発行機能
    function issueTokens() public {
        // Dapp トークンを発行できるのはあなたのみであることを確認する
        require(msg.sender == owner, "caller must be the owner");

        // 投資家が預けた偽Daiトークンの数を確認し、同量のDappトークンを発行する
        for(uint i=0; i<stakers.length; i++){
            // recipient は Dapp トークンを受け取る投資家
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0){
                dappToken.transfer(recipient, balance);
            }
        }
    }

    //　3.アンステーキング機能
    // * 投資家は、預け入れた Dai を引き出すことができる
    function unstakeTokens(uint _amount) public {
        // 投資家がステーキングした金額を取得する
        uint balance = stakingBalance[msg.sender];
        // 投資家がステーキングした金額が0以上であることを確認する
        require(balance > _amount, "staking balance should be more than unstaked amount");
        // 偽の Dai トークンを投資家に返金する
        daiToken.transfer(msg.sender, _amount);
        // 返金した分のdappTokenを利子として付与する
        dappToken.transfer(msg.sender, _amount);
        // 投資家のステーキング残高を0に更新する
        stakingBalance[msg.sender] = balance - _amount;
        // 投資家のステーキング状態を更新する
        isStaking[msg.sender] = false;
    }
}
