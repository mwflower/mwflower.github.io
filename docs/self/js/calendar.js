/**
 * jquery.calendar.js 1.0
 * http://jquerywidget.com
 */
/* 公历转农历代码思路：
1、建立农历年份查询表
2、计算输入公历日期与公历基准的相差天数
3、从农历基准开始遍历农历查询表，计算自农历基准之后每一年的天数，并用相差天数依次相减，确定农历年份
4、利用剩余相差天数以及农历每个月的天数确定农历月份
5、利用剩余相差天数确定农历哪一天 

执行：<script type="text/javascript">$('.calendar1').calendar();</script>
*/

// 农历1949-2100年查询表
;var lunarYearArr = [
    0x0b557, //1949
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, //1950-1959
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, //1960-1969
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, //1970-1979
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, //1980-1989
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, //1990-1999
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, //2000-2009
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, //2010-2019
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, //2020-2029
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, //2030-2039
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, //2040-2049
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, //2050-2059
    0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, //2060-2069
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, //2070-2079
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, //2080-2089
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, //2090-2099
    0x0d520 //2100
];
var lunarMonth = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
var lunarDay = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '初', '廿'];
var tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
var diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
var sx = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
// var terms = ['立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至', '小寒', '大寒',];
// holiday = {"正月初一": "春节", "正月十五": "元宵", "二月初二": "龙抬头", "五月初五": "端午"，"七月初七": "七夕", "七月十四": "七月半", "八月十五": "中秋", "九月初九": "重阳", "腊月三十": "除夕", "4月5日": "清明", "12月21日": "冬至"};

// 计算农历年是否有闰月，参数为存储农历年的16进制
// 农历年份信息用16进制存储，其中16进制的最后1位可以用于判断是否有闰月
function hasLeapMonth(ly) {
    // 获取16进制的最后1位，需要用到&与运算符
    if (ly & 0xf) {
        return ly & 0xf
    } else {
        return false
    }
}
// 如果有闰月，计算农历闰月天数，参数为存储农历年的16进制
// 农历年份信息用16进制存储，其中16进制的第1位（0x除外）可以用于表示闰月是大月还是小月
function leapMonthDays(ly) {
    if (hasLeapMonth(ly)) {
        // 获取16进制的第1位（0x除外）
        return (ly & 0xf0000) ? 30 : 29
    } else {
        return 0
    }
}
// 计算农历一年的总天数，参数为存储农历年的16进制
// 农历年份信息用16进制存储，其中16进制的第2-4位（0x除外）可以用于表示正常月是大月还是小月
function lunarYearDays(ly) {
    var totalDays = 0;

    // 获取正常月的天数，并累加
    // 获取16进制的第2-4位，需要用到>>移位运算符
    for (var i = 0x8000; i > 0x8; i >>= 1) {
        var monthDays = (ly & i) ? 30 : 29;
        totalDays += monthDays;
    }
    // 如果有闰月，需要把闰月的天数加上
    if (hasLeapMonth(ly)) {
        totalDays += leapMonthDays(ly);
    }

    return totalDays
}
// 获取农历每个月的天数，参数需传入16进制数值
function lunarYearMonths(ly) {
    var monthArr = [];

    // 获取正常月的天数，并添加到monthArr数组中
    // 获取16进制的第2-4位，需要用到>>移位运算符
    for (var i = 0x8000; i > 0x8; i >>= 1) {
        monthArr.push((ly & i) ? 30 : 29);
    }
    // 如果有闰月，需要把闰月的天数加上
    if (hasLeapMonth(ly)) {
        monthArr.splice(hasLeapMonth(ly), 0, leapMonthDays(ly));
    }

    return monthArr
}
// 将农历年转换为天干，参数为农历年
function getTianGan(ly) {
    var tianGanKey = (ly - 3) % 10;
    if (tianGanKey === 0) tianGanKey = 10;
    return tianGan[tianGanKey - 1]
}
// 将农历年转换为地支，参数为农历年
function getDiZhi(ly) {
    var diZhiKey = (ly - 3) % 12;
    if (diZhiKey === 0) diZhiKey = 12;
    return diZhi[diZhiKey - 1]
}
// 公历转农历函数
function sloarToLunar(sy, sm, sd) {
    // 输入的月份减1处理
    sm -= 1;

    // 计算与公历基准的相差天数
    // Date.UTC()返回的是距离公历1970年1月1日的毫秒数,传入的月份需要减1
    var daySpan = (Date.UTC(sy, sm, sd) - Date.UTC(1949, 0, 29)) / (24 * 60 * 60 * 1000) + 1;
    var ly, lm, ld, lsx;
    // 确定输出的农历年份
    for (var j = 0; j < lunarYearArr.length; j++) {
        daySpan -= lunarYearDays(lunarYearArr[j]);
        if (daySpan <= 0) {
            ly = 1949 + j;
            // 获取农历年份确定后的剩余天数
            daySpan += lunarYearDays(lunarYearArr[j]);
            break
        }
    }

    // 确定输出的农历月份
    for (var k = 0; k < lunarYearMonths(lunarYearArr[ly - 1949]).length; k++) {
        daySpan -= lunarYearMonths(lunarYearArr[ly - 1949])[k];
        if (daySpan <= 0) {
            // 有闰月时，月份的数组长度会变成13，因此，当闰月月份小于等于k时，lm不需要加1
            if (hasLeapMonth(lunarYearArr[ly - 1949]) && hasLeapMonth(lunarYearArr[ly - 1949]) <= k) {
                if (hasLeapMonth(lunarYearArr[ly - 1949]) < k) {
                    lm = k;
                } else if (hasLeapMonth(lunarYearArr[ly - 1949]) === k) {
                    lm = '闰' + k;
                } else {
                    lm = k + 1;
                }
            } else {
                lm = k + 1;
            }
            // 获取农历月份确定后的剩余天数
            daySpan += lunarYearMonths(lunarYearArr[ly - 1949])[k];
            break
        }
    }

    // 确定输出农历哪一天
    ld = daySpan;

    // 将计算出来的农历月份转换成汉字月份，闰月需要在前面加上闰字
    if (hasLeapMonth(lunarYearArr[ly - 1949]) && (typeof (lm) === 'string' && lm.indexOf('闰') > -1)) {
        lm = `闰${lunarMonth[/\d/.exec(lm) - 1]}`
    } else {
        lm = lunarMonth[lm - 1];
    }

    // 将计算出来的农历年份转换为天干地支年
    lsx = sx[(ly - 4) % 12]
    ly = getTianGan(ly) + getDiZhi(ly);

    // 将计算出来的农历天数转换成汉字
    if (ld < 11) {
        ld = `${lunarDay[10]}${lunarDay[ld-1]}`
    } else if (ld > 10 && ld < 20) {
        ld = `${lunarDay[9]}${lunarDay[ld-11]}`
    } else if (ld === 20) {
        ld = `${lunarDay[1]}${lunarDay[9]}`
    } else if (ld > 20 && ld < 30) {
        ld = `${lunarDay[11]}${lunarDay[ld-21]}`
    } else if (ld === 30) {
        ld = `${lunarDay[2]}${lunarDay[9]}`
    }

    return {
        lunarSx: lsx,
        lunarYear: ly,
        lunarMonth: lm,
        lunarDay: ld,
    }
}
(function (factory) {
    if (typeof define === "function" && (define.amd || define.cmd) && typeof jQuery == 'undefined'){
        // AMD或CMD
        define(['jquery'],function(){
            factory(jQuery);
            return jQuery;
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function( root, jQuery ) {
            if ( jQuery === undefined ) {
                if ( typeof window !== 'undefined' ) {
                    jQuery = require('jquery');
                } else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        //Browser globals
        factory(jQuery);
    }
}(function ($) {
    $.fn.calendar = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
            prefix:'widget',            //生成日历的class前缀
            isRange:false,              //是否选择范围
            limitRange:[],              //有效选择区域的范围
            highlightRange:[],          //指定日期范围高亮
            onChange:function(){},      //当前选中月份修改时触发
            onSelect:function(){}       //选择日期时触发
        };
        var options = $.extend({}, defaults, parameter);
        return this.each(function() {
            var $this = $(this);
            var $table = $('<table>').appendTo($this);
            var $caption = $('<caption>').appendTo($table);
            var $prevYear = $('<a class="'+options.prefix+'-prevYear" href="javascript:;">&lt;&lt;</a>').appendTo($caption);
            var $prevMonth = $('<a class="'+options.prefix+'-prevMonth" href="javascript:;">&lt;</a>').appendTo($caption);
            var $title = $('<span>').appendTo($caption);
            var $nextMonth = $('<a class="'+options.prefix+'-nextMonth" href="javascript:;">&gt;</a>').appendTo($caption);
            var $nextYear = $('<a class="'+options.prefix+'-nextYear" href="javascript:;">&gt;&gt;</a>').appendTo($caption);
            var $back = $('<a class="'+options.prefix+'-back" href="javascript:;">今天</a>').appendTo($caption);
            var _today,         //当天
                _data,          //日期数据
                _day,           //日历状态
                _range = [];    //当前选择范围
            /*****  节点修改 *****/
            $table.append('<thead><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead>');
            var $tbody = $('<tbody>').appendTo($table);
            var $tfoot = $('<tfoot>').appendTo($table);
            /***** 私有方法 *****/
            //获取日期数据
            var getDateObj = function(year,month,day){
                var date = arguments.length&&year?new Date(year,month-1,day):new Date();
                var obj = {
                    'year':date.getFullYear(),
                    'month':date.getMonth()+1,
                    'day':date.getDate(),
                    'week':date.getDay()
                };
                obj['code'] = ''+obj['year']+(obj['month']>9?obj['month']:'0'+obj['month'])+(obj['day']>9?obj['day']:'0'+obj['day']);
                return obj;
            };
            //获取当月天数
            var getMonthDays = function(obj){
                var day = new Date(obj.year,obj.month,0);
                return  day.getDate();
            };
            //获取某天日期信息
            var getDateInfo = function(obj){
                if(options.limitRange.length){
                    obj['status'] = 'disabled';
                    for(var i=0;i<options.limitRange.length;i++){
                        var start = options.limitRange[i][0];
                        var end =  options.limitRange[i][1];
                        if(start=='today'){
                            start = _today['code'];
                        }
                        if(end=='today'){
                            end = _today['code'];
                        }
                        if(start>end){
                            start = [end,end=start][0];
                        }
                        if(obj['code']>=start&&obj['code']<=end){
                            obj['status'] = '';
                            break;
                        }
                    }
                }
                obj['sign'] = [];
                if(options.highlightRange.length){
                    for(var i=0;i<options.highlightRange.length;i++){
                        var start = options.highlightRange[i][0];
                        var end =  options.highlightRange[i][1];
                        if(start=='today'){
                            start = _today['code'];
                        }
                        if(end=='today'){
                            end = _today['code'];
                        }
                        if(start>end){
                            start = [end,end=start][0];
                        }
                        if(obj['code']>=start&&obj['code']<=end){
                            obj['sign'].push('highlight');
                            break;
                        }
                    }
                }
                if(obj['code']==_today['code']){
                    obj['sign'].push('today');
                }
                return obj;
            };
            var getData = function(obj){
                if(typeof obj=='undefined'){
                    obj = _today;
                }
                _day = getDateObj(obj['year'],obj['month'],1);      //当月第一天
                var days = getMonthDays(_day);              //当月天数
                var data = [];                              //日历信息
                var obj = {};
                //上月日期
                for(var i=_day['week'];i>0;i--){
                    obj = getDateObj(_day['year'],_day['month'],_day['day']-i);
                    var info = getDateInfo(obj);
                    if(!options.limitRange.length){
                        info['status'] = 'disabled';
                    }
                    data.push(info);
                }
                //当月日期
                for(var i=0;i<days;i++){
                    obj = {
                        'year':_day['year'],
                        'month':_day['month'],
                        'day':_day['day']+i,
                        'week':(_day['week']+i)%7
                    };
                    obj['code'] = ''+obj['year']+(obj['month']>9?obj['month']:'0'+obj['month'])+(obj['day']>9?obj['day']:'0'+obj['day']);
                    var info = getDateInfo(obj);
                    data.push(info);
                }
                //下月日期
                var last = obj;
                for(var i=1;last['week']+i<7;i++){
                    obj = getDateObj(last['year'],last['month'],last['day']+i);
                    var info = getDateInfo(obj);
                    if(!options.limitRange.length){
                        info['status'] = 'disabled';
                    }
                    data.push(info);
                }
                return data;
            };
            var format = function(data){
                options.onChange(_day);
                for(var i=0;i<data.length;i++){
                    var d = data[i];
                    if(d['status'] == 'active'){
                        d['status'] = '';
                    }
                }
                if(_range.length==2){
                    var start = _range[0]['code'];
                    var end = _range[1]['code'];
                    for(var i=0;i<data.length;i++){
                        var d = data[i];
                        if(d['code']>=start&&d['code']<=end){
                            if(d['status']=='disabled'){
                                _range[1]=d;
                                break;
                            }else{
                                d['status'] = 'active';
                            }
                        }
                    }
                }else if(_range.length==1){
                    for(var i=0;i<data.length;i++){
                        var d = data[i];
                        if(d['code']==_range[0]['code']){
                            d['status'] = 'active';
                        }
                    }
                }
                var html = '<tr>';
                for(var i=0,len=data.length;i<len;i++){
                    var day = data[i];
                    var arr = [];
                    for(var s=0;s<day['sign'].length;s++){
                        arr.push(options.prefix+'-'+day['sign'][s]);
                    }
                    if(day['status']){
                        arr.push(options.prefix+'-'+day['status']);
                    }
                    var className = arr.join(' ');
                    html+='<td'+(className?' class="'+className+'"':'')+' data-id="'+i+'">\
                        '+(day['link']?'<a href="'+day['link']+'">'+day['day']+'</a>':'<span>'+day['day']+'</span>')+'\
                    </td>';
                    if(i%7==6&&i<len-1){
                        html+='</tr><tr>';
                    }
                }
                html+='</tr>';
                $title.html(_day['year']+'年'+_day['month']+'月');
                $tbody.html(html);
                if(_day['year'] == _today['year'] && _day['month'] == _today['month']){
                    var lunar = sloarToLunar(_today['year'], _today['month'], _today['day'])
                }else{
                    var lunar = sloarToLunar(_day['year'], _day['month'], 1)
                }
                $tfoot.html('<tr><td colspan="7">' + lunar.lunarYear + lunar.lunarSx + '年 ' + lunar.lunarMonth + '月' + lunar.lunarDay + '</td></tr>');

            };
            /***** 初始化 *****/
            _today = getDateObj();
            _day = {
                'year':_today['year'],
                'month':_today['month'],
            };
            $prevMonth.click(function(){
                _day['month']--;
                _data = getData(_day);
                format(_data);
            });
            $nextMonth.click(function(){
                _day['month']++;
                _data = getData(_day);
                format(_data);
            });
            $prevYear.click(function(){
                _day['year']--;
                _data = getData(_day);
                format(_data);
            });
            $nextYear.click(function(){
                _day['year']++;
                _data = getData(_day);
                format(_data);
            });
            $back.click(function(){
                _data = getData();
                var day = _today;
                if(day['status']!='disabled'){
                    _range = [day];
                    options.onSelect(_range);
                }
                format(_data);
            });
            $this.on('click','td',function(){
                var $this = $(this);
                var index = $(this).data('id');
                var day = _data[index];
                if(day['status']!='disabled'){
                    if(options.isRange){
                        if(_range.length!=1){
                            _range = [day];
                            format(_data);
                        }else{
                            _range.push(day);
                            _range.sort(function(a,b){
                                return a['code']>b['code'];
                            });
                            format(_data);
                            options.onSelect(_range);
                        }
                    }else{
                        _range = [day];
                        format(_data);
                        options.onSelect(_range);
                        // 农历
                        var lunar = sloarToLunar(day['year'], day['month'], day['day'])
                        $tfoot.html('<tr><td colspan="7">' + lunar.lunarYear + lunar.lunarSx + '年 ' + lunar.lunarMonth + '月' + lunar.lunarDay + '</td></tr>');
                    }
                }
            });
            _data = getData();
            format(_data);
        });
    };
}));
