const symbol = require('/node_modules/symbol-sdk')

const GENERATION_HASH = '57F7DA205008026C776CB6AED843393F04CD458E0AA2D9F1D5F31A402072B2D6'
const EPOCH = 1615853185
const XYM_ID = '6BED913FA20223F8'
const NODE_URL = 'https://nis2.host:3001'
const NET_TYPE = symbol.NetworkType.MAIN_NET

const repositoryFactory = new symbol.RepositoryFactoryHttp(NODE_URL)       // RepositoryFactory is for creating a Repository that provides functions such as accounts and mosaics provided by Symbol-SDK
const accountHttp = repositoryFactory.createAccountRepository()
const transactionHttp = repositoryFactory.createTransactionRepository()


setTimeout(() => {
  
const address = symbol.Address.createFromRawAddress(window.SSS.activeAddress)

const dom_addr = document.getElementById('wallet-addr')
dom_addr.innerText = address.pretty()                                       // address.pretty() The address is displayed as a string separated by hyphens, making it easier to read

accountHttp.getAccountInfo(address)
  .toPromise()
  .then((accountInfo) => {
    for (let m of accountInfo.mosaics) {
      if (m.id.id.toHex() === XYM_ID) {
        const dom_xym = document.getElementById('wallet-xym')
        dom_xym.innerText = `XYM Balance : ${m.amount.compact() / Math.pow(10, 6)}`
      }
    }
  })
 
    //　Detect transaction with listener and play sound
  
 
  nsRepo = repositoryFactory.createNamespaceRepository();
  
  wsEndpoint = NODE_URL.replace('http', 'ws') + "/ws";
  listener = new symbol.Listener(wsEndpoint,nsRepo,WebSocket);
  
  
  listener.open().then(() => {

    //Detect block generation (every 30 seconds) for constant monitoring without disconnection of Websocket

    //block generation detection
    listener.newBlock()
    .subscribe(block=>{
      console.log(block);
    });
    
    //Detecting Approval Transactions
    listener.confirmed(address)
    .subscribe(tx=>{
        //Describe the processing after receiving
        console.log(tx);
         // play approval tone
        var my_audio = new Audio("https://github.com/symbol/desktop-wallet/raw/dev/src/views/resources/audio/ding2.ogg");
        my_audio.currentTime = 0;  //Return the playback start position to the beginning
        my_audio.play();  //play sound     
    });

    //Detection of unauthorized transactions
    listener.unconfirmedAdded(address)
    .subscribe(tx=>{
        //Describe the processing after receiving
        console.log(tx);
      　　// Play Unconfirmed Transaction Sound
        var my_audio = new Audio("https://github.com/symbol/desktop-wallet/raw/dev/src/views/resources/audio/ding.ogg");
        my_audio.currentTime = 0;  //Return the playback start position to the beginning
        my_audio.play();  //play sound 
    });
    
    
   
  });
  
  
  // ////////////////////////
  
                                  // Get transaction history
const searchCriteria = {                                   
  group: symbol.TransactionGroup.Confirmed,
  address,
  pageNumber: 1,
  pageSize: 10,
  order: symbol.Order.Desc,
}

console.log("searchCriteria=");  //////////////////
console.log(searchCriteria);    //////////////////
  
console.log("transactionHttp=");/////////////////
console.log(transactionHttp);   //////////////////

transactionHttp
  .search(searchCriteria)
  .toPromise()
  .then((txs) => {
    console.log("txs=");         /////////////////
    console.log(txs);           /////////////////
    const dom_txInfo = document.getElementById('wallet-transactions')
    
    console.log("dom_txInfo="); ////////////////
    console.log(dom_txInfo);    ////////////////
    
    for (let tx of txs.data) {   //    loop through the array
      console.log("tx=");      ////////////////////
      console.log(tx);
      const dom_tx = document.createElement('div')
      const dom_txType = document.createElement('div')
      const dom_hash = document.createElement('div')
      const dom_signer_address = document.createElement('div')
      const dom_recipient_address = document.createElement('div')
      
      

      dom_txType.innerText = `Tx Type : ${getTransactionType(tx.type)}`        //　string concatenation 　Tx type
      //dom_hash.innerText = `Tx Hash : ${tx.transactionInfo.hash}`              //  string concatenation　 Tx hash
      dom_hash.innerHTML = `Tx Hash : <a href="https://symbol.fyi/transactions/${tx.transactionInfo.hash}" target="_blank" rel="noopener noreferrer"><small>${tx.transactionInfo.hash}</small></a>`
      dom_signer_address.innerText = `From : ${tx.signer.address.address}`    //  Combining strings Sender
      
    if (tx.type === 16724) {  
      dom_recipient_address.innerText = `To   : ${tx.recipientAddress.address}`//  String concatenation Destination
    }
      

      dom_tx.appendChild(dom_txType)                    // dom_txType をdom_txに追加 
      dom_tx.appendChild(dom_hash)                      // dom_hash をdom_txに追加
      dom_tx.appendChild(dom_signer_address)
    
    if (tx.type === 16724) { 
      dom_tx.appendChild(dom_recipient_address)
    }
      
      dom_tx.appendChild(document.createElement('hr'))  // draw a horizontal lineく

      dom_txInfo.appendChild(dom_tx)                    // Add transaction information
    }
  })
}, 500)


function getTransactionType (type) { // https://symbol.github.io/symbol-sdk-typescript-javascript/1.0.3/enums/TransactionType.html
  switch(type){
  　case 16724:
    　return 'Transfer'
    　break;
  　case 16961:
    　return 'Aggregate Bonded'
    　break;  
    case 16705:
    　return 'Aggregate Complete'
    　break;
    default:
  　　return 'Other Transaction'
  }
}

// handleSSS関数はトランザクションを作成し、window.SSS.setTransaction関数を実行しSSSにトランザクションを登録します。そしてwindow.SSS.requestSign関数を実行し、SSSを用いた署名をユーザ－に要求します。

function handleSSS() {
  console.log('handle sss');
  const addr = document.getElementById('form-addr').value
  const amount = document.getElementById('form-amount').value
  const message = document.getElementById('form-message').value
  
  const tx = symbol.TransferTransaction.create(        // トランザクションを生成
    symbol.Deadline.create(EPOCH),
    symbol.Address.createFromRawAddress(addr),
    [
      new symbol.Mosaic(
        new symbol.MosaicId(XYM_ID),
        symbol.UInt64.fromUint(Number(amount)*1000000)
      )
    ],
    symbol.PlainMessage.create(message),
    NET_TYPE,
    symbol.UInt64.fromUint(100000)
  )

  window.SSS.setTransaction(tx)                 // SSSにトランザクションを登録

  window.SSS.requestSign().then(signedTx => {   // SSSを用いた署名をユーザーに要求
    console.log('signedTx', signedTx)
    transactionHttp.announce(signedTx)
    
    
  })
}
