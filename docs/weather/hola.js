function getUrlParam(name) {
    var reg = new RegExp("(^|&)"+name+"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    } else {
        return undefined;
    }
}

    var apikey = getUrlParam('akey');
    var locakey = getUrlParam('lock');
    if(apikey != undefined&&locakey != undefined){
        fetch('https://dataservice.accuweather.com/forecasts/v1/daily/1day/'+locakey+'?apikey='+apikey+'&language=zh-cn&metric=true')
        .then(res => res.json())
        .then(json => show(json))
    }
    function show(json){
        document.getElementById('icon').innerHTML = '<img src="/Weathericons/'+json.DailyForecasts[0].Day.Icon+'.png" width="100">'
        document.getElementById('temp').innerHTML = json.DailyForecasts[0].Temperature.Minimum.Value+' / '+json.DailyForecasts[0].Temperature.Maximum.Value+'°C';
        document.getElementById('desc').innerHTML = json.DailyForecasts[0].Day.IconPhrase;
    }
