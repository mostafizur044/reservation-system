$(document).ready(function(){
    /*********** Time var******** */
    var bookForm = '';
    var bookTo = '';
    var shiftStart = 0;
    var shiftEnd = 0;
    var dateArray = [];
    var shiftTime = true;
    /*********** Price var******** */
    var emp8Hour = 120;
    var empHourRate = emp8Hour/8;
    var emp8To10HourRate = empHourRate*1.5;
    var emp10To12HourRate = empHourRate*2;
    var empNightRate = empHourRate*1.5;
    var empNight8To12Rate = empHourRate*2;
    var empSat2Rate = empHourRate*1.5;
    var empSat2To12Rate = empHourRate*2;
    var empSatNightRate = empHourRate*2;
    var empSunRate = empHourRate*2;
    var toolDaily = 50;
    var totalPrice = 0;
    var invoice =[];
    /*********** View Function******** */

    $('#invoice-details').attr('disabled',true);
    $('#total-calculation').attr('disabled',true);

    $('.datetime').datetimepicker({
        minDate:moment()
    }); 

    function shift(id){
        $(id).append($('<option>',
        {
            value: 24,
            text : '12:00 AM'
        }));
        for(var i=1; i<12;i++){
            let time = i+':00 AM';
            $(id).append($('<option>',
            {
                value: i,
                text : time 
            }));
        }
        $(id).append($('<option>',
        {
            value: 12,
            text : '12:00 PM'
        }));
        for(var j=1; j<12;j++){
            let time = j+':00 PM';
            $(id).append($('<option>',
            {
                value: j+12,
                text : time 
            }));
        }
    }
    shift('#shift1');
    shift('#shift2');
    
    /********************Main Calculation*****************/
    $("#startDate .input-group-btn button").click(function(){
        $('input#book-from').focus();
    });

    $("#endDate .input-group-btn button").click(function(){
        $('input#book-to').focus();
    });

    $("#booking_options input#book-from").blur(function(){
        bookFrom = '';
        bookFrom = $(this).val();
        console.log(bookFrom);
        if(bookTo&&shiftStart&&shiftEnd){
            empHourCal(shiftStart,shiftEnd);
        }
    });

    $("#booking_options input#book-to").blur(function(){
        bookTo = '';
        bookTo = $(this).val();
        console.log(bookTo);
        if(bookFrom&&shiftStart&&shiftEnd){
            empHourCal(shiftStart,shiftEnd);
        }
    });

    $("#shift1").change(function(){
        shiftStart ='';
        shiftStart = $('#shift1 option:selected').val();
        console.log(shiftStart);
        if(shiftEnd){
            empHourCal(shiftStart,shiftEnd);
        }
    });

    $("#shift2").change(function(){
        shiftEnd = $('#shift2 option:selected').val();
        console.log(shiftEnd);
        if(shiftStart){
            empHourCal(shiftStart,shiftEnd);
        }
    });

    function empHourCal(s,e){
        bookFrom = $('input#book-from').val();
        bookTo = $('input#book-to').val();
        var shift = 0;  
        var start = parseInt(s);
        var end = parseInt(e);
        if(start>=6 && start<18){
            shiftTime = true;
            dateArray = getDates(bookFrom,bookTo,0); 
            console.log(dateArray); 
            shift = end-start;
        } else {
            shiftTime = false;
            dateArray = getDates(bookFrom,bookTo,86400000); 
            console.log(dateArray); 
            if(start<end) {
                shift = end-start;
            } else {
                shift = (24+end)-start;
            }
        }
        console.log('shift: ' + shift);
        var totalHour = shift * dateArray.length;
        $('#employee-hours').val(totalHour);
        $('.calculator #total-calculation').attr('disabled',false);
    }

    function getDates(d1,d2,night){
        var days = [];
        var date1 = new Date(d1).getTime()+night;
        var date2 = new Date(d2).getTime()+night;
        for(date1;date1<=date2;date1+=86400000){
            var y = new Date(date1).getFullYear();
            var m = new Date(date1).getMonth()+1;
            var d = new Date(date1).getDate();
            var date = y+'-'+m+'-'+d;
            days.push(date);
        }
        return days;
    }

     /************Total calculation**************/

    $('#total-calculation').click(function(){
        var start = parseInt(shiftStart);
        var end = parseInt(shiftEnd);
        totalPrice = 0;
        invoice =[];
        var total = 0;
        var shift = 0;
        quantity =  $('#input-quantity option:selected').val();
        if(shiftTime){
            invoice = dayShiftCal();
            console.log(invoice);
            total = calTotal(invoice);
            shift = end-start;
        } else {
            invoice = nightShiftCal();
            console.log(invoice);
            total = calTotal(invoice);
            if(start<end) {
                shift = end-start;
            } else {
                shift = (24+end)-start;
            }
        }

        var toolsPrice = shift>4? toolDaily: (toolDaily/2);

        totalPrice = (total + toolsPrice)*quantity;

        console.log('Grand: ' + totalPrice);

       $('.ph-book-now-total #showDays').text(dateArray.length + ' Day(s)');
       var finalPrice = '$' + totalPrice +' Incl. GST';
       $('.ph-book-now-total #showPrice').text(finalPrice);
       $('#collapse1').collapse();
       $('#invoice-details').attr('disabled',false);

     });

    function calTotal(data){
        let total = 0;
        for(var t=0;t<data.length;t++){
            total += data[t]['price'];
        }
        console.log(total);
        return total;
    }

     /************Day calculation**************/

     function dayShiftCal(){
        var arr = [];
        var start = parseInt(shiftStart);
        var end = parseInt(shiftEnd);
        for(var d = 0; d<dateArray.length; d++){
            switch (new Date(dateArray[d]).getDay()){
                case 0:
                    var obj = {};
                    obj['date'] = dateArray[d];
                    obj['day'] = 'Sunday';
                    obj['rate'] = empSunRate;
                    obj['hour'] = end - start;
                    var s = (start>=12? (start==12?12:start-12)+' PM': start+' AM');
                    var e = (end==24? '12 AM':(end>=12? (end==12?12:end-12)+' PM': end+' AM'));
                    obj['time'] = s + ' - ' + e;
                    obj['price'] = obj['rate'] * obj['hour'];
                    arr.push(obj);
                    break;
                case 6:
                    var dif1 = (end - start)>=2? 2:1;
                    var dif2 = (end - start)-2;
                    if(dif1<=2){
                        var obj = {};
                        var shesh = (start+dif1);
                        obj['date'] = dateArray[d];
                        obj['day'] = 'Saturday';
                        obj['rate'] = empSat2Rate;
                        obj['hour'] = dif1;
                        var s = (start>=12? (start==12?12:start-12)+' PM': start+' AM');
                        var e = (shesh==24? '12 AM': (shesh>=12? (shesh==12?12:shesh-12)+' PM': shesh+' AM'));
                        obj['time'] = s + ' - ' + e;
                        obj['price'] = obj['rate'] * obj['hour'];
                        arr.push(obj);
                    } 
                    if(dif2>0){
                        var obj = {};
                        obj['date'] = dateArray[d];
                        obj['day'] = 'Saturday';
                        var shuru = (start+2);
                        obj['rate'] = empSat2To12Rate;
                        obj['hour'] = dif2;
                        var s = (shuru>=12? (shuru==12?12:shuru-12)+' PM': shuru+' AM');
                        var e = (end==24? '12 AM':(end>=12? (end==12?12:end-12)+' PM': end+' AM'));
                        obj['time'] = s + ' - ' + e;
                        obj['price'] = obj['rate'] * obj['hour'];
                        arr.push(obj); 
                    }
                    break;
                default: 
                    var en = end>18? 18:end;
                    var night = end - 18;
                    if(en>0 && en<=18){
                        var dif = (en - start);
                        var dif1 = dif>=8? 8:dif;
                        var dif2 = (dif-8)<=2? (dif-8):2;
                        var dif3 = (dif-10);
                        if(dif1>0 && dif1<=8){
                            var obj = {};
                            var shesh = (start+dif1);
                            obj['date'] = dateArray[d];
                            obj['day'] = 'Weekday';
                            obj['rate'] = empHourRate;
                            obj['hour'] = dif1;
                            var s = (start>=12? (start==12?12:start-12)+' PM': start+' AM');
                            var e = (shesh>=12? (shesh==12?12:shesh-12)+' PM': shesh+' AM');
                            obj['time'] = s + ' - ' + e;
                            obj['price'] = obj['rate'] * obj['hour'];
                            arr.push(obj);
                        } 
                        if(dif2>0 && dif2<=2){
                            var obj = {};
                            obj['date'] = dateArray[d];
                            obj['day'] = 'Weekday';
                            var shuru = (start+8);
                            var shesh = start+8 + dif2;
                            obj['rate'] = emp8To10HourRate;
                            obj['hour'] = dif2;
                            var s = (shuru>=12? (shuru==12?12:shuru-12)+' PM': shuru+' AM');
                            var e = (shesh>=12? (shesh==12?12:shesh-12)+' PM': shesh+' AM');
                            obj['time'] = s + ' - ' + e;
                            obj['price'] = obj['rate'] * obj['hour'];
                            arr.push(obj); 
                        }
                        if(dif3>0){
                            var obj = {};
                            obj['date'] = dateArray[d];
                            obj['day'] = 'Weekday';
                            var shuru = (start+12);
                            obj['rate'] = emp10To12HourRate;
                            obj['hour'] = dif2;
                            var s = (shuru>=12? (shuru==12?12:shuru-12)+' PM': shuru+' AM');
                            var e = (en>=12? (en==12?12:en-12)+' PM': en+' AM');
                            obj['time'] = s + ' - ' + e;
                            obj['price'] = obj['rate'] * obj['hour'];
                            arr.push(obj); 
                        }
                    } 
                    if(night>0){
                        var obj = {};
                        obj['date'] = dateArray[d];
                        obj['day'] = 'Weekday';
                        obj['rate'] = empNightRate;
                        obj['hour'] = night;
                        var s = '6 PM';
                        var e = (end==24? '12 AM': (end-12)+' PM');
                        obj['time'] = s + ' - ' + e;
                        obj['price'] = obj['rate'] * obj['hour'];
                        arr.push(obj); 
                    }
                    break;
            }
        }

        return arr;
     }

     /************night calculation**************/

     function nightShiftCal(){
        var arr = [];
        var start = parseInt(shiftStart);
        var end = parseInt(shiftEnd);
        for(var d = 0; d<dateArray.length; d++){
            switch (new Date(dateArray[d]).getDay()){
                case 0:
                    var obj = {};
                    obj['date'] = dateArray[d];
                    obj['day'] = 'Sunday';
                    obj['rate'] = empSunRate;
                    if(start<end) {
                        obj['hour'] = end-start;
                    } else {
                        obj['hour'] = (24+end)-start;
                    }
                    var s = (start==24? '12 AM':(start>=12? (start==12?12:start-12)+' PM': start+' AM'));
                    var e = (end==24? '12 AM':(end>=12? (end==12?12:end-12)+' PM': end+' AM'));
                    obj['time'] = s + ' - ' + e;
                    obj['price'] = obj['rate'] * obj['hour'];
                    arr.push(obj);
                    break;
                case 6:
                    var en = end>6 && end <18 ? 6:end;
                    var day = end>6 && end <18? (end-6):0;
                    if(en<=6 || en >=18){
                        var obj = {};
                        obj['date'] = dateArray[d];
                        obj['day'] = 'Saturday';
                        obj['rate'] = empSatNightRate;
                        if(start<en) {
                            obj['hour'] = en-start;
                        } else {
                            obj['hour'] = (24+en)-start;
                        }
                        var s = (start==24? '12 AM':(start>=12? (start==12?12:start-12)+' PM': start+' AM'));
                        var e = (en==24? '12 AM':(en>=12? (en==12?12:en-12)+' PM': en+' AM'));
                        obj['time'] = s + ' - ' + e;
                        obj['price'] = obj['rate'] * obj['hour'];
                        arr.push(obj);
                    }
                    if(day>0){
                        var obj = {};
                        var dif = day<2? day:2;
                        obj['date'] = dateArray[d];
                        obj['day'] = 'Saturday';
                        obj['rate'] = empSat2Rate;
                        obj['hour'] = dif;
                        var s = '6 AM';
                        var e =  (6 + dif) + ' AM';
                        obj['time'] = s + ' - ' + e;
                        obj['price'] = obj['rate'] * obj['hour'];
                        arr.push(obj);
                    }
                    if(day>2){
                        var obj = {};
                        obj['date'] = dateArray[d];
                        obj['day'] = 'Saturday';
                        obj['rate'] = empSat2To12Rate;
                        obj['hour'] = day-2;
                        var s = '8 AM';
                        var e = (end==24? '12 AM':(end>=12? (end==12?12:en-12)+' PM': end+' AM'));
                        obj['time'] = s + ' - ' + e;
                        obj['price'] = obj['rate'] * obj['hour'];
                        arr.push(obj);
                    }
                    break;
                default:
                    var en = end>6 && end <18 ? 6:end;
                    var day = end>6 && end <18? (end-6):0;
                    if(en<=6 || en >=18){
                        var dif=0, dif1=0, dif2 = 0;
                        if(start<en) {
                            dif = en-start;
                            dif1 = dif>=8? 8:dif;
                            dif2 = (dif-8);
                        } else {
                            dif = (24+en)-start;
                            dif1 = dif>=8? 8:dif;
                            dif2 = (dif-8);
                        }
                        if(dif1>0 && dif1<=8){
                            var obj = {};
                            var shesh = (start+dif1)>24? (start+dif1)-24:(start+dif1);
                            obj['date'] = dateArray[d];
                            obj['day'] = 'Weekday';
                            obj['rate'] = empNightRate;
                            obj['hour'] = dif1;
                            var s = (start==24? '12 AM':(start>=12? (start==12?12:start-12)+' PM': start+' AM'));
                            var e = (shesh==24? '12 AM':(shesh>=12? (shesh==12?12:shesh-12)+' PM': shesh+' AM'));
                            obj['time'] = s + ' - ' + e;
                            obj['price'] = obj['rate'] * obj['hour'];
                            arr.push(obj);
                        } 
                        if(dif2>0){
                            var obj = {};
                            obj['date'] = dateArray[d];
                            obj['day'] = 'Weekday';
                            var shuru = ((start+dif1)>24? (start+dif1)-24:(start+dif1));
                            var shesh = ((shuru+dif2)>24? (shuru+dif2)-24:(shuru+dif2));
                            obj['rate'] = empNight8To12Rate;
                            obj['hour'] = dif2;
                            var s = (shuru==24? '12 AM':(shuru>=12? (shuru==12?12:shuru-12)+' PM': shuru+' AM'));
                            var e = (shesh==24? '12 AM':(shesh>=12? (shesh==12?12:shesh-12)+' PM': shesh+' AM'));
                            obj['time'] = s + ' - ' + e;
                            obj['price'] = obj['rate'] * obj['hour'];
                            arr.push(obj); 
                        }
                    } 
                    if(day>0){
                        var obj = {};
                        var dif3 = day<8? day:8;
                        obj['date'] = dateArray[d];
                        obj['day'] = 'Weekday';
                        obj['rate'] = empHourRate;
                        obj['hour'] = dif3;
                        var s = '6 AM';
                        var e =  (6 + dif3) + ' AM';
                        obj['time'] = s + ' - ' + e;
                        obj['price'] = obj['rate'] * obj['hour'];
                        arr.push(obj);
                    }
                    if(day>8){
                        var obj = {};
                        var dif3 = day<10? (day-8):2;
                        obj['date'] = dateArray[d];
                        obj['day'] = 'Weekday';
                        obj['rate'] = emp8To10HourRate;
                        obj['hour'] = dif3;
                        var s = (6+8) +' AM';
                        var e = (6+8+dif3) + ' PM';
                        obj['time'] = s + ' - ' + e;
                        obj['price'] = obj['rate'] * obj['hour'];
                        arr.push(obj);
                    }
                    if(day>10){
                        var obj = {};
                        obj['date'] = dateArray[d];
                        obj['day'] = 'Weekday';
                        obj['rate'] = emp8To10HourRate;
                        obj['hour'] = day-10;
                        var s = (6+10) + ' AM';
                        var e = (end==24? '12 AM':(end>=12? (end==12?12:end-12)+' PM': end+' AM'));
                        obj['time'] = s + ' - ' + e;
                        obj['price'] = obj['rate'] * obj['hour'];
                        arr.push(obj);
                    }
                    break;
            }
        }

        return arr;
     }


     /**********Make invoice************/

    $('#invoice-details').click(function(){
        $('.emp-daily-rate').text('Daily '+emp8Hour+' AUD');
        $('.emp-hour-rate').text('Hourly '+empHourRate+' AUD');
        $('.tool-daily').text('Daily '+toolDaily+' AUD');
        $('.tool-hour').text('Half Day '+(toolDaily/2)+' AUD');
        var p = invoice;
        for(var a=0; a<p.length;a++){
            var dom =  '<div class="row">'+
                    '<div class="col-sm-6">'+p[a].date+'('+p[a].time+') '+ p[a].day+'</div>'+
                    '<div class="col-sm-2">'+p[a].hour+'</div>'+
                    '<div class="col-sm-2">'+p[a].rate+'</div>'+
                    '<div class="col-sm-2">'+p[a].price+'</div>'+
                    '</div>';

            $('.invoiceDetails-div').append(dom);
        }
          
    });

    
    



    
});

