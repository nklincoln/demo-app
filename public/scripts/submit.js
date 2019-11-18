// Use ajax calls
const apiUrl = location.protocol + '//' + location.host + "/api/";

//check user input and call server
$('.submit-txn').click(async function() {
  console.log('Submitting Transaction');
  submitTransaction(true);
});

$('.evaluate-txn').click(async function() {
  console.log('Evaluating Transaction');
  submitTransaction(false);
});

function submitTransaction(isSubmit) {

  //get user input data
  var walletPath = $('.wallet-path input').val();
  var idName = $('.identity input').val();
  const ccp = $('.ccp input').val();
  const channelName = $('.channel-name input').val();
  const contractName = $('.contract-name input').val();
  const args = $('.args input').val();

  const inputData = {
    walletPath,
    idName,
    ccp,
    channelName,
    contractName,
    args,
    isSubmit
  }

  $.ajax({
    type: 'POST',
    url: apiUrl + 'submitTransaction',
    data: JSON.stringify(inputData),
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
    
    success: function(data) {
      //check data for error
      if (data.error) {
        $('.response').html(data.error);
        return;
      } else {

        $('.response').html(JSON.stringify(data));
      }

    },
    error: function(jqXHR, textStatus, errorThrown) {
      //reload on error
      $('.response').html(errorThrown)
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);
    },
  });
            
}
