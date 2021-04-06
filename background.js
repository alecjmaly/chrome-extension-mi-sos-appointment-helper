function fetchRetry(url, options) {
  // Return a fetch request
  return fetch(url, options).then(res => {
    // check if successful. If so, return the response transformed to json
    if (res.ok) return res.text()
    // else, return a call to fetchRetry
    return fetchRetry(url, options)
  })
}




var calIDs = []

chrome.runtime.onConnect.addListener(function (port) {
  var results = []
  console.log('test ' + port.name)
  console.assert(port.name == "knockknock");
  port.onMessage.addListener(function (msg) {
    console.log(msg)

    if (msg.calID) {
      let calID = msg.calID
      // get appointment details
      let url = 'https://district1.as.me/schedule.php?action=showCalendar&fulldate=1&owner=21391307&template=monthly'
      let options = {
        "headers": {
          "accept": "*/*",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        "body": "type=21151975&calendar=" + calID + "&skip=true&options%5Bqty%5D=1&options%5BnumDays%5D=5&ignoreAppointment=&appointmentType=&calendarID=" + calID,
        "method": "POST",
        "mode": "cors"
      }

      let resp = fetchRetry(url, options).then(text => {
        return text
      }).then(html => {

        let ele = document.createElement('div')
        ele.innerHTML = html

        return ele.querySelector('.scheduleday.activeday').getAttribute('day') || ''
      })

      resp.then(date => { 
        port.postMessage({ calID: msg.calID, name: msg.name, date: date, url: msg.url }) 
      })


      
      console.log('done after port post')
      // port.postMessage({question: 'test'});
    }
  });
});
