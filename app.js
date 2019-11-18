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

  // Create Wallet
  let wallet;
  if (fs.existsSync(req.body.walletPath)) {
    wallet = new FileSystemWallet(req.body.walletPath);
  } else {
    const msg = `Invalid wallet path: ${req.body.walletPath}`;
    res.json({
      error: msg
    });
    return;
  }

  // retrieve Id from wallet
  const hasUser = await wallet.exists(req.body.idName);
  if (!hasUser) {
      const msg = `No user identity "${req.body.idName}" found in wallet`;
      res.json({
        error: msg
      });
      return;
  }

  // Retrieve CCP
  let connectionProfile;
  if (fs.existsSync(req.body.ccp)) {
    const ccpJSON = fs.readFileSync(req.body.ccp, 'utf8');
    connectionProfile = JSON.parse(ccpJSON);
  } else {
    const msg = `Path to connection profile invalid: ${req.body.ccp}`;
    res.json({
      error: msg
    });
    return;
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

    // Extract network and contract
    const network = await gateway.getNetwork(req.body.channelName);
    const contract = await network.getContract(req.body.contractName);

    // Submit the txn  
    const args = req.body.args;
    const argArray = args.slice(1, -1).split(',');
    const func = argArray[0];
    const funcArgs = argArray.slice(1);

    let response;
    if (req.body.isSubmit) {
      console.debug(`Submitting smart contract function ${func}, with args ${[...funcArgs]}`);
      await contract.submitTransaction(func, ...funcArgs);
      response = `Successfully submitted smart contract function ${func}`;
    } else {
      console.debug(`Evaluating smart contract function ${func}, with args ${[...funcArgs]}`);
      response = await contract.evaluateTransaction(func, ...funcArgs);
    }
    
    res.json({
      success: response.toString()
    });
  } catch (error) {
    res.json({
      error: JSON.stringify(error)
    });
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
  console.log(`Application running on: http://localhost:${port}`);
});
