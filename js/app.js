function getUrlParam(name) {
    var reg = new RegExp("(^|&)"+name+"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    } else {
        return undefined;
    }
}

function dateFilter(date){ //值小于10时，在前面补0
    if(date < 10){
        return "0"+date;
    }
    return date;
}

let trans = () => {
    document.documentElement.classList.add('transition');
    window.setTimeout(() => {
        document.documentElement.classList.remove('transition');
    }, 1000)
}

function lazyimg(url,success,error){
    let img = new Image();
    if(error) img.onerror = error();
    img.addEventListener('load', success(img), false);
    img.src = url;
}

const app = new class{
    cardlist = [];
    config = undefined;
    readycount = 0;
    headler(stage){
        if(stage=='splash'){
            this.readycount++;
            if(app.config.main.force_dark) document.documentElement.setAttribute('data-theme', 'darktheme');
            if(app.config.meta.background_url!=''&&this.readycount==2) this.main();
            else if(app.config.meta.background_url==''&&this.readycount==1) this.main();
        }
    }
    init(){
        console.log('Now initializing...');
        $('#splashcap').html('请稍等，正在加载配置文件');
        if(!getUrlParam('config')){
            $('#splash img').attr('src','res/error.svg');
            $('#splashcap').html('错误：没有传递配置文件参数');
            return undefined;
        }
        $.ajax({url:getUrlParam('config'),timeout:10000,success:function(result){
            app.config = result;
            if(app.config.meta.background_url!='') $('#background').attr('style','opacity:0;').html('<img src="'+app.config.meta.background_url+'" width="1080" onload="$(\'#background\').animate({opacity:'+app.config.meta.background_opacity+'},500,\'swing\');app.headler(\'splash\')">');
            $('#splash').animate({opacity:0},500,'swing',function(){
            $('#splash').html('<img src="'+app.config.meta.icon_url+'" onload="$(\'#splash\').animate({opacity:1},500,\'swing\');app.headler(\'splash\');">');
        })
        },error:function(err){
            $('#splash img').attr('src','res/error.svg');
            $('#splashcap').html('错误：获取配置文件失败');
            console.error('Error when loading config');
        }})
    }
    main(){
        $('script').html('');
        $('#container').animate({opacity:0},100,'swing',function(){
            $(this).html('').attr('style','');
            $('#container').append(card.time);
            if(getUrlParam('demo')=='true') app.startdemo();
            app.timeservice = setInterval(function(){app.service('time')},10);
            app.dateservice = setInterval(function(){app.service('date')},100);
            if(app.config.main.accu_locationkey&&app.config.main.accu_apikey) app.service('getweather');
            if(app.config.main.autodark){app.service('audark');
            app.darkservice=setInterval(function(){app.service('audark')}, 2000);}
            $('#container').attr('style','opacity:0;')
            $('#container').animate({opacity:1},500,'swing')
            try{
                const ccc = async () => {
                    console.log('start loading cards');
                    for (let i=0;i<app.config.cards.length;i++) {
                        var item = app.config.cards[i];
                        if(item.sourcetype=='external') var src = await $.ajax({url:item.source,timeout:10000});
                        else if(item.sourcetype=='internal') var src = item.source;
                        if(item.title) $('#container').append(card.title(item.title));
                        $('#container').append(src);
                        $('script').append($('#'+item.id+' script').html());
                        $('#'+item.id+' script').remove();
                        app.cardlist.push(item.id);
                    }
                    console.log('cards loading completed.')
                }
                ccc();
            }catch(err){
                mdui.snackbar({
                    message: '加载卡片时发生错误：'+err
                  });
            }
        })
    }
    hour(){
        if(typeof app.demo === "boolean"&&app.demo) return app.simhour;
        return moment().hour();
    }
    minute(){
        if(typeof app.demo === "boolean"&&app.demo) return app.simminute;
        return moment().minute();
    }
    second(){
        if(typeof app.demo === "boolean"&&app.demo) return app.simsecond;
        return moment().second();
    }
    startdemo(){
        app.demo = true;
        app.simhour = 0;
        app.simminute = 0;
        app.simsecond = 0;
        app.demodaemon = setInterval(function(){
            if(app.simsecond >= 60){
                app.simminute++;
                app.simsecond = 0;
            }
            if(app.simminute >= 60){
                app.simminute = 0;
                app.simhour++;
            }
            if(app.simhour>=24){
                app.simhour = 0;
            }
            app.simsecond+=30;
        },40)
    }
    service(arg){
        if(arg=='audark'){
            var sunrise = 7;
            var sunset = 18;
            if(app.weatherinfo){
                sunrise = moment(app.weatherinfo.DailyForecasts[0].Sun.Rise).hour()+moment(app.weatherinfo.DailyForecasts[0].Sun.Rise).minute()/60;
                sunset = moment(app.weatherinfo.DailyForecasts[0].Sun.Set).hour()+moment(app.weatherinfo.DailyForecasts[0].Sun.Set).minute()/60;
            }
                var present = app.hour() + app.minute()/60;
                var label = document.documentElement.getAttribute('data-theme');
                if(present>=sunrise&&present<=sunset){
                    if(label=='lighttheme'||label==undefined) return;
                    document.documentElement.setAttribute('data-theme', 'lighttheme');
                    trans();
                    $('.date').animate({opacity:0},500,'swing',function(){
                        clearInterval(app.dateservice);
                        $(this).html('暗色主题已禁用')
                        $('.date').animate({opacity:1},500,'swing',function(){
                            var i = setInterval(function(){
                                clearInterval(i);
                                $('.date').animate({opacity:0},500,'swing',function(){
                                    app.service('date');
                                    app.dateservice = setInterval(function(){app.service('date')},1000);
                                    $('.date').animate({opacity:1},500,'swing');
                                })
                            },3000)
                        })

                    })
                }else if(label != 'darktheme'){
                    document.documentElement.setAttribute('data-theme', 'darktheme');
                    trans();
                    $('.date').animate({opacity:0},500,'swing',function(){
                        clearInterval(app.dateservice);
                        $(this).html('暗色主题已启用')
                        $('.date').animate({opacity:1},500,'swing',function(){
                            var i = setInterval(function(){
                                clearInterval(i);
                                $('.date').animate({opacity:0},500,'swing',function(){
                                    app.service('date');
                                    app.dateservice = setInterval(function(){app.service('date')},1000);
                                    $('.date').animate({opacity:1},500,'swing');
                                })
                            },1500)
                        })

                    })
                }
                //MORE
        }
        if(arg=='getweather'){
            $.ajax({url:'http://dataservice.accuweather.com/forecasts/v1/daily/1day/'+app.config.main.accu_locationkey+'?apikey='+app.config.main.accu_apikey+'&language=zh-cn&details=true',timeout:20000,success:function(result){
                app.weatherinfo = result;
                if(app.cardlist.indexOf('weather')!=-1) weathercardinit();
            },error:function(err){
                mdui.snackbar({
                    message: '获取天气数据失败'+err
                  });
            }})
        }
        if(arg=='time'){
            $('.time').html(dateFilter(app.hour())+':'+dateFilter(app.minute()));
        }
        if(arg=='date'){
            if(app.demo) return $('.date').html('演示模式');
            var mo = moment().month()+1;
            var da = moment().day()+1
            $('.date').html(moment().year()+'年'+mo+'月'+da+'日');
        }
    }
}

const card = new class{
    time = '<div class="title text"><div class="time"></div><div class="date"></div></div>';
    title(text){
        return '<div class="title text">'+text+'</div>';
    }
}