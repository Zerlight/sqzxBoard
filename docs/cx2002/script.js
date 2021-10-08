function dateFilter(date){ //值小于10时，在前面补0
  if(date < 10){
      return "0"+date;
  }
  return date;
}

function myTime() {
    let time = new Date();
    let hh = time.getHours();
    let mm = time.getMinutes();
    let cont = dateFilter(hh)+':'+dateFilter(mm);
    document.getElementById('clo').innerHTML = cont;
  }
  myTime();
  setInterval(myTime,100);
