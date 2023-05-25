import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as tokenJson from "./assets/MyToken.json";
import * as ballotJson from "./assets/Ballot.json";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppService {
  provider: ethers.providers.BaseProvider;
  contract: ethers.Contract;
  ballot_contract: ethers.Contract;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ALCHEMY_API_KEY')
    this.provider = new ethers.providers.AlchemyProvider('maticmum', apiKey)
    this.contract = new ethers.Contract(this.getAddress(), tokenJson.abi, this.provider)
    this.ballot_contract = new ethers.Contract(this.getBallotAddress(), ballotJson.abi, this.provider)
  }

  getHello(): string {
    return 'Hello World!';
  }
  
  getLastBlock(): Promise<ethers.providers.Block> {
    const provider = ethers.getDefaultProvider("goerli")
    return provider.getBlock('latest') 
  }

  getAddress() {
    const tokenAddress = this.configService.get<string>("TOKEN_ADDRESS");
    return tokenAddress;
  }

  getBallotAddress() {
    const ballotAddress = this.configService.get<string>("BALLOT_ADDRESS");
    return ballotAddress;
  }
  
  getTotalSupply() {
    return this.contract.totalSupply();
  }
  
  getBalanceOf(address: string) {
    return this.contract.balanceOf(address);
  }
  
  async getTransactionReceipt(hash: string) {
    const tx = await this.provider.getTransaction(hash);
    const receipt = await tx.wait()
    return receipt
  }

  async getReceipt(tx: ethers.providers.TransactionResponse) {
    return await tx.wait()
  }

  async requestTokens(address: string, signature: string) {
    const pKey = this.configService.get<string>('PRIVATE_KEY')
    const wallet = new ethers.Wallet(pKey)
    const signer = wallet.connect(this.provider)
    //return this.contract.balanceOf(address);
    return this.contract.connect(signer).mint(address, ethers.utils.parseUnits("1"));
  }

  // Was the initial idea but i realised it's incorrect.
  //async delegateTokens(address: string) {
  //  const pKey = this.configService.get<string>('PRIVATE_KEY')
  //  const wallet = new ethers.Wallet(pKey)
  //  const signer = wallet.connect(this.provider)
  //  return this.contract.connect(signer).delegate(address)
  //}

  //async castVote() {
  //  const pKey = this.configService.get<string>('PRIVATE_KEY')
  //  const wallet = new ethers.Wallet(pKey)
  //  const signer = wallet.connect(this.provider)
  //  return this.ballot_contract.connect(signer).vote(0, ethers.utils.parseUnits("1"))
  //}

  async getWinner() {
    return this.ballot_contract.winnerName()
  }
}
