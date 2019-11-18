'use strict';

//get libraries
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const fs = require('fs');

const { FileSystemWallet, Gateway } = require('fabric-network');

//create express web-app
const app = express();

//bootstrap application settings
app.use(express.static('./public'));
app.use('/scripts', express.static(path.join(__dirname, '/public/scripts')));
app.use(bodyParser.json());

//get home page
app.get('/home', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

//get transaction submission page
app.get('/transact', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/transact.html'));
});

//post call to submit transaction
app.post('/api/submitTransaction', async function(req, res) {
  //print variables
  console.log('Using params:' + JSON.stringify(req.body));

  // Create Wallet
  const wallet = new FileSystemWallet(req.body.walletPath);

  // retrieve Id from wallet
  const hasUser = await wallet.exists(req.body.idName);
  if (!hasUser) {
      console.error(`No user identity "${req.body.idName}" found in wallet`);
  }

  // Retrieve CCP
  let connectionProfile;
  if (fs.existsSync(req.body.ccp)) {
    const ccpJSON = fs.readFileSync(req.body.ccp, 'utf8');
    connectionProfile = JSON.parse(ccpJSON);
  } else {
    console.error(`Path to connection profile invalid: ${req.body.ccp}`)
  }

  // Create and connect Gateway
  const gateway = new Gateway();

  const opts = {
    wallet,
    identity: req.body.idName,
    discovery: {
      enabled: true,
      asLocalhost: true
    }
  };

  try {
    // Connect the gateway
    await gateway.connect(connectionProfile, opts);
    console.log(`Successfully connected to gateway`);

    // Extract network and contract
    const network = await gateway.getNetwork(req.body.channelName);
    console.log(`Successfully retrieved network from channel ${req.body.channelName}`);

    const contract = await network.getContract(req.body.contractName);
    console.log(`Successfully retrieved contract ${req.body.contractName}`);

    // Submit the txn  
    const args = req.body.args;
    const argArray = args.slice(1, -1).split(',');
    const func = argArray[0];
    const funcArgs = argArray.slice(1);

    let response;
    if (req.body.isSubmit) {
      console.log(`Submitting smart contract function ${func}, with args ${[...funcArgs]}`);
      response = await contract.submitTransaction(func, ...funcArgs);
      console.log(`Successfully submitted smart contract function ${func}`);
    } else {
      console.log(`Evaluating smart contract function ${func}, with args ${[...funcArgs]}`);
      response = await contract.evaluateTransaction(func, ...funcArgs);
      console.log(`Successfully evaluated smart contract function ${func}, with response ${response.toString()}`);
    }
    
    res.json({
      success: response.toString()
    });
  } catch (error) {
    console.error(`Failed with error: ${error}`);
    throw error;
  } finally {
    await gateway.disconnect();
  }
});

//declare port
var port = process.env.PORT || 8000;
if (process.env.VCAP_APPLICATION) {
  port = process.env.PORT;
}

//run app on port
app.listen(port, function() {
  console.log('app running on port: %d', port);
});
