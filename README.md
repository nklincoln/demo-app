# VSCode Demonstration Application
This is a demonstration application for using the components exported from VS Code using the IBM Blockchain Platform extension for Hyperledger Fabric.

Having exported:
 - wallet
 - connection profile

It is possible to use the application to submit or evaluate transactions, using the network model.

## Pre-requisites

This application assumes that a connection profile and a wallet (populated with a valid identity) will be provided for a Hyperledger Fabric network, on which a smart contract has been installed and instantiated.

Required:
- [VS Code version 1.35.1 or greater](https://code.visualstudio.com/)
- [IBM Blockchain Platform extension](https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform)
- [Docker version v17.06.2-ce or greater](https://docs.docker.com/install/)
- [Docker Compose v1.14.0 or greater](https://docs.docker.com/compose/install/)
- [Node v8.x or v10.x and npm v6.x or greater](https://nodejs.org/en/download/)

## Using

Having installed dependencies via `npm install`, the application may be started using `npm start`.

1) Within VS Code, ensure that you have been able to connect to, and interact with, a deployed smart contract.
2) Under `Fabric Wallets` export the wallet that contains the identity that will be used to interact with the deployed smart contract.
3) Under `Fabric Gateways` export the connection profile
4) In the application `Transact` page, enter the requested information:
	- Fully qualified path to the exported wallet
	- Identity to use from the wallet
	- Fully qualified path to exported connection profile
	- The channel name in which the contract is instantiated
	- The contract name to use
	- Arguments for the transaction [methodName, arg0, arg1, ..., argN]
5) Select `SUBMIT` or `EVALUATE`