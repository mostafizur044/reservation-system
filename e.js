$(document).ready(function(){
    $('#invoice-details').attr('disabled',true);
    $('#total-calculation').attr('disabled',true);

    $('.datetime').datetimepicker({
        minDate:moment()
    }); 
    var dayRate = 120;
    var dayRateless10 = dayRate*1.5;
    var dayRategreater10 = dayRate*2;
    var nightRate = dayRateless10;
    var nightRategreater8 =dayRategreater10;
    var satDayRate = dayRateless10;
    var satDayRategreater2 = dayRategreater10;
    var satNightRate = dayRategreater10;
    var sunDayrate = dayRategreater10;
    var sunNightrate = dayRategreater10;
    var bookFrom = '';
    var bookTo = '';
    var quantity = 0;
    var rentTime = '';
    var period = {};
    var empHour = 0;
    var empHourRate = 20;
    var perItemPrice = 0;
    var totalPrice = 0;


    
    $("input#book-from").blur(function(){
        bookFrom = '';
        bookFrom = $(this).val();
        console.log(bookFrom);
        var time = checkDayNight(bookFrom);
        $('#'+time).attr('checked',true);
        fillFields(bookFrom,bookTo);
    });

    $("input#book-to").blur(function(){
        bookTo = '';
        bookTo = $(this).val();
        console.log(bookTo);
        fillFields(bookFrom,bookTo);
    });

    function fillFields(start,end){
        if(start&&end){
            period = getDate(start,end);
            var emp = empHours(period);
            $('#employee-rate').val(emp);
            $('#total-calculation').attr('disabled',false);
        }
    }

    $("#startDate .input-group-btn button").click(function(){
        $('input#book-from').focus();
    });

    $("#endDate .input-group-btn button").click(function(){
        $('input#book-to').focus();
    });

    function getDate(d1,d2){
        var date1 = new Date(d1);
        var date2 = new Date(d2);
        var diff = (date2.getTime() - date1.getTime())/86400000;
        var day = Math.floor(diff); 
        var hour = Math.round((diff - day)*24);
        return {day:day,hour:hour};
    }

    function checkDayNight(d){
        let time = new Date(d).getHours();
        if(time>=18) return 'NIGHT';
        return 'DAY';
    }

    function empHours(time){
        console.log(time)
        return fullShift = time['day']*8 + (time['hour']>8? 8: time['hour']);
    }

    function getDays(d1,d2,night){
        var days = [];
        d1 = d1.slice(0,10) + ' 00:00';
        d2 = d2.slice(0,10) + ' 00:00';
        var date1 = new Date(d1).getTime()+night;
        var date2 = new Date(d2).getTime()+night;
        for(date1;date1<=date2;date1+=86400000){
            var d = new Date(date1);
            days.push(d);
        }
        return days;
    }

    $('#total-calculation').click(function(){
       totalPrice = 0;
       empHour =  $('#employee-rate').val();
       quantity =  $('#input-quantity option:selected').val();
       rentTime = $('.form-check input:radio:checked').val();
       if(rentTime=='DAY'){
            if(period['day']>0){
                var weekDays = getDays(bookFrom,bookTo,0);
                console.log(empHour,quantity,rentTime ,weekDays);
                for(var i=1;i<weekDays.length-1;i++){
                    var d = weekDays[i];
                    totalPrice += getTotalForDay(d,sunDayrate,satDayRategreater2,dayRategreater10);
                    console.log(totalPrice);
                }
                totalPrice += firstDayCal(weekDays[0],bookFrom);
                console.log(totalPrice);
                totalPrice += lastDayCal(weekDays[weekDays.length-1],bookTo);
                console.log(totalPrice);
            } else {
                totalPrice = dayHourCal(bookFrom,period['hour']);
                console.log(totalPrice);
            }

       } else {
            if(period['day']>0){
                var weekDays = getDays(bookFrom,bookTo,86400000);
                console.log(empHour,quantity,rentTime ,weekDays);
                for(var i=1;i<weekDays.length-1;i++){
                    var d = weekDays[i];
                    totalPrice += getTotalForDay(d,sunNightrate,satNightRate,nightRategreater8);
                    console.log(totalPrice);
                }
                totalPrice += firstNightCal(weekDays[0],bookFrom);
                console.log(totalPrice);
                totalPrice += lastNightCal(weekDays[weekDays.length-1],bookTo);
                console.log(totalPrice);
            }else {
                totalPrice = nightHourCal(bookFrom,period['hour']);
                console.log(totalPrice);
            }
            
       }
       perItemPrice = totalPrice;
       totalPrice *= quantity;
       var empCost = empHour*empHourRate;
       totalPrice += empCost;
       console.log('GrandTotal: ' + totalPrice);

       var showDays = period['day'] + ' day(s) '+ period['hour'] + ' hour(s)';
       $('.ph-book-now-total #showDays').text(showDays);
       var finalPrice = '$' + totalPrice +' Incl. GST';
       $('.ph-book-now-total #showPrice').text(finalPrice);
       $('#collapse1').collapse();
       $('#invoice-details').attr('disabled',false);
    });

    function getTotalForDay(d,sunRate,satRate,dayRate){
        switch (new Date(d).getDay()) {
            case 0:
                return sunRate;
            case 6:
                return satRate;
            default: 
                return dayRate;
        }
    }

    function firstDayCal(dayDate,dayTime){
        let day = new Date(dayDate).getDay();
        let time = new Date(dayTime).getHours();
        if(time<10) {
            switch (day) {
                case 0:
                    return sunDayrate;
                case 6:
                    return satDayRategreater2;
                default: 
                    if(time>8) return dayRateless10;
                    return dayRategreater10;
            }
        } else {
            let t = 18 - time;
            switch (day) {
                case 0:
                    return sunDayrate;
                case 6:
                    if(t>2) return satDayRategreater2;
                    return satDayRate;
                default: 
                    return (dayRate/8)*t;
            }
        }
    }

    function firstNightCal(nightDate,nightTime){
        let day = new Date(nightDate).getDay();
        let time = new Date(nightTime).getHours();
        if(time>18 && time<22) {
            switch (day) {
                case 0:
                    return sunNightrate;
                case 6:
                    return satNightRate;
                default: 
                    return nightRate;
            }
        } else {
            let t=0;
            switch (true) {
                case time==23:
                    t=7;
                case time<=6: 
                    t = 6-time;
            }
             
            switch (day) {
                case 0:
                    return sunNightrate;
                case 6:
                    return satNightRate;
                default: 
                    return (nightRate/8)*t;
            }
        }
    }

    function lastDayCal(dayDate,dayTime){
        let day =  new Date(dayDate).getDay();
        let time =  new Date(dayTime).getHours();
        switch (day) {
            case 0:
                return sunDayrate;
            case 6:
                switch (true) {
                    case time<8:
                        return (satDayRate/2)*(8-time);
                    default: 
                        return satDayRategreater2;
                }
            default: 
                switch (true) {
                    case time<14:
                        return dayRate*(14-time);
                    case time>14 && time<=16:
                        return dayRateless10;
                    case time>16:
                        return dayRategreater10;;
                    default: 
                        return dayRate;
                }
        }
    }

    function lastNightCal(nightDate,nightTime){
        let day = new Date(nightDate).getDay();
        let time = new Date(nightTime).getHours();
        if(time>18){
            switch (day) {
                case 0:
                    return sunNightrate;
                case 6:
                    return satNightRate;
                default: 
                    return (nightRate/8)*(time-18);
            }
        } else {
            switch (time) {
                case 0:
                    return (nightRate/8)*(8-6)-nightRate;
                case 1:
                    return (nightRate/8)*(8-7)-nightRate;
                default: 
                    return 0;
            }
        } 
        
    }

    function dayHourCal(d1,hour){
        switch (new Date(d1).getDay()) {
            case 0:
                return sunDayrate
            case 6:
                switch (true) {
                    case hour==1:
                        return satDayRate/2;
                    case hour==2:
                        return satDayRate;
                    default: 
                        return satDayRategreater2;
                }
            default: 
                switch (true) {
                    case hour<8:
                        return dayRate*0.15*hour;
                    case hour==8:
                        return dayRate;
                    case hour>8 && hour<=10:
                        return dayRateless10;
                    case hour>10:
                        return dayRategreater10;
                }
        }
    }

    function nightHourCal(d1,hour){
        let date = new Date(d1).getTime() + 86400000;
        switch (new Date(date).getDay()) {
            case 0:
                return sunNightrate;
            case 6:
                return satNightRate;
            default: 
                switch (true) {
                    case hour<8:
                        return nightRate*0.15*hour;
                    case hour==8:
                        return nightRate;
                    case hour>8:
                        return nightRategreater8;
                }
        }
    }

    $('#invoice-details').click(()=>{
        var d1 = bookFrom.slice(0,10);
        var d2 = bookTo.slice(0,10);
        $('.item-price').text(dayRate+' AUD');
        $('.item-qunt').text(quantity + ' item(s)');
        $('.charge-text').text('1 item price ('+d1 +' to '+ d2+')');
        $('.charge-val').text(perItemPrice +' AUD');
        $('.qunt-charge-text').text(quantity + ' item(s) price ('+d1 +' to '+ d2+')');
        $('.qunt-charge-val').text(perItemPrice*quantity +' AUD');
        $('.emp-rate').text(empHourRate);
        $('.emp-hour').text(empHour + ' hour(s)');
        $('.emp-total-charge').text(empHourRate*empHour +' AUD');
        $('.total-period').text(period['day'] + ' day(s) '+ period['hour'] + ' hour(s)');
        $('.total-cost').text(totalPrice +' AUD');
    });

    
    



    
});

