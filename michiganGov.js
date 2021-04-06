// runs on https://www.michigan.gov/


var port = chrome.runtime.connect({
  name: "knockknock"
});


var loc_dates = []

port.onMessage.addListener(function (msg) {

  console.log(msg)

  
  // update or add to glboal location/dates array
  loc_dates.map(ele => { return ele.calID }).includes(msg.calID) ? loc_dates.filter(ele => { return ele.calID === msg.calID }).forEach(ele => { ele.date = msg.date }) : loc_dates.push(msg)
  // sort newest date on top
  loc_dates = loc_dates.sort((a,b) => { return new Date(a.date) - new Date(b.date)})


  // output summary to top
  let text_output = '\nSOONEST APPOINTMENTS ARE ON TOP.<br>Proceed to make an appointment at these locations.<br><br>' + loc_dates.map(ele => { return ele.date + ' :  '  + ele.name + ' (<a style="color:blue;text-decoration:underline" target="_blank" href="' + ele.url + '">make appointment</a>)<br>' }).join('\n')

  loc_dates.forEach(obj => { try { document.querySelector('som-bol').shadowRoot.querySelector('[href*="' + decodeURIComponent(obj.name) + '"]').innerText = "Make Appointment (" + obj.date + ")" } catch {} } )

  if (document.querySelector('#myOutput')) {
    document.querySelector('#myOutput').innerHTML = text_output
  } else {

    let ele = document.createElement('div')
    ele.id = 'myOutput'
    ele.innerText = text_output

    document.querySelector('.page-header').appendChild(ele)
  }



  // update "Make Appointment" buttons with dates
  try { 
    document.querySelector('som-bol').shadowRoot.querySelector('[href*="' + decodeURIComponent(msg.calID) + '"]').innerText = "Make Appointment (" + msg.date + ")" 
  } catch {} 


    // soonest
  // reset colors
  document.querySelector('som-bol').shadowRoot.querySelectorAll('.card').forEach(ele => { ele.style.backgroundColor = "" })
  // highlight
  let soonestLoc = document.querySelector('som-bol').shadowRoot.querySelector('[href*="' + decodeURIComponent(loc_dates[0].calID) + '"]').parentNode.parentNode.parentNode.parentNode
  soonestLoc.style.backgroundColor = 'yellow'
  // soonestLoc.scrollIntoView({block: "center"})

});




// main code
var num_cards = document.querySelector('som-bol').shadowRoot.querySelectorAll('.card').length



function RefreshAppointments() {
  loc_dates = []
  Array.from(document.querySelector('som-bol').shadowRoot.querySelectorAll('.card')).forEach(ele => {
    port.postMessage({
      name: ele.textContent.split(" away")[0].trim(),
      calID: ele.querySelector('.btn').href.split('=')[1],
      url: ele.querySelector('.btn').href,
      timeout: 1
    }); 
  })
}

let button = document.createElement('button')
button.id = 'refresh-appointments-btn'
button.style.visibility = 'hidden'
button.textContent = 'Refresh appointment dates'
button.onclick = () => {
  RefreshAppointments()
}

document.querySelector('.page-header').appendChild(button)




// main loop
setInterval(() => {
  var curr_num_cards = document.querySelector('som-bol').shadowRoot.querySelectorAll('.card').length

  if (curr_num_cards != num_cards) {
    console.log("CHANGED", curr_num_cards, num_cards)
    num_cards = curr_num_cards
    
    // do stuff
    if (curr_num_cards != 0) {
      RefreshAppointments()
      document.querySelector('#refresh-appointments-btn').style.visibility = 'visible'
    } else {
      document.querySelector('#refresh-appointments-btn').style.visibility = 'hidden'
      if (document.querySelector('#myOutput')) {
        document.querySelector('#myOutput').innerText = ''
      }
    }
  } 
}, 250)
