define(['gsdata', 'highcharts', 'underscore'], function (gsdata) {
	var defaultOption = {
		title: {
			text: ''
		},
		credits: {
			enabled: false
		},
		tooltip: {
			// valueSuffix: ' customize'
			// pointFormat: '{series.name} produced <b>{point.y:,.0f}</b><br/>warheads in {point.x}'
		},
	};
	
	var angularTypes = {
		line : true,
		bar : true,
		column : true,
		spline : true,
		areaspline : true,
		area : true
	};
	
	//create set by grouping by array
	function _utils_groupBy(list, key) {
		var length = list.length || 0, i = 0, temp = {}, result = [], exist = {};
		for (; i < length; i++) {
			temp = list[i];
			exist[temp[key]] || result.push(temp[key]); // && exist[list[i]] = exist[list[i]] + 1;
			exist[temp[key]] = true;
		}
		return result;
	}
	
	//deal with transforming between different charts
	function _preprocess(option, chartOpts) {
		var chartType = chartOpts.chartType || 'line',
			chartConfig = chartOpts.chartConfig || {}, yAxes = chartConfig.yAxes || [];
		if (chartType === 'scatter' || chartType === 'bubble') {
			if (yAxes.length === 1) {
				if (chartType === 'bubble') {
					yAxes.push(yAxes[0], yAxes[0]);
				} else {
					yAxes.push(yAxes[0]);
				}
			} else if (yAxes.length === 2 && chartType === 'bubble') {
				yAxes.push(yAxes[1]);
			} else if (yAxes.length === 3 && chartType === 'scatter') {
				yAxes.pop();
			}
		} else if (chartType === 'columnrange' || chartType === 'arearange') {
			if (yAxes.length === 1) {
				yAxes.unshift('noneExist');
			}
		} else {
			if (yAxes.length > 1) {
				chartConfig.yAxes = [yAxes[0]];
			}
		}
	}
	
	//get series, get xAxis's of series, get set of xAxis
	function _prepareOption(option, chartOpts) {
		var chartType = chartOpts.chartType || 'line',
			chartDatas = chartOpts.chartDatas || {}, list = chartDatas.rows || [],
			chartConfig = chartOpts.chartConfig || {}, yAxes = chartConfig.yAxes || [],
			xAxes = chartConfig.xAxes || [], series = chartConfig.series || [], 
			xAxisCol = xAxes[0] || '', xAxisColVal = null, xAxisType = '',
			seriesCol = series[0] || '',  seriesColVal = null, 
		
			length = list.length || 0, i = 0, temp = {},  
			existSeries = {}, existCategories = {},
			seriesResult = [], catagoriesResult = [], catagoriesObj = {};//record all catagories.
			seriesWithCatas = {}, defaultValue = 0;
		
		if (yAxes.length === 2) {
			defaultValue = [0, 0];
		} else if (yAxes.length === 3) {
			defaultValue = [0, 0, 0];
		}
		
		for (; i < length; i++) {
			//Todo : check each column type
			temp = list[i];
			if (seriesCol) {
				seriesColVal = temp[seriesCol];
				existSeries[seriesColVal] || seriesResult.push(seriesColVal);
				existSeries[seriesColVal] = true;
				
				if (xAxisCol) {
					xAxisColVal = temp[xAxisCol];
					existCategories[xAxisColVal] || (catagoriesResult.push(xAxisColVal) && (catagoriesObj[xAxisColVal] = defaultValue));
					existCategories[xAxisColVal] = true;
					/* if (seriesWithCatas[seriesColVal]) {
						seriesWithCatas[seriesColVal].push(xAxisColVal);
					} else {
						seriesWithCatas[seriesColVal] = [xAxisColVal];
					} */
				}
			} else {
				if (xAxisCol) {
					xAxisColVal = temp[xAxisCol];
					existCategories[xAxisColVal] || (catagoriesResult.push(xAxisColVal) && (catagoriesObj[xAxisColVal] = defaultValue));
					existCategories[xAxisColVal] = true;
				}
			}
		}
		
		if (catagoriesResult.length > 0) {
			xAxisType = 'category';
		} else {
			xAxisType = 'linear';
		}
		
		option.preparedOptions = {
			'seriesResult' : seriesResult,
			'catagoriesResult' : catagoriesResult,
			'catagoriesObj' : catagoriesObj,
			'seriesWithCatas' : seriesWithCatas,
			'xAxisType' : xAxisType,
			'withxAxis' : (xAxes.length > 0),
			'withSeries' : (series.length > 0)
		};
		
		if (chartType === 'scatter' || chartType === 'bubble') { // scatter chart only have series and yAsex, xAsix can't work in this chart.
			option.preparedOptions.xAxisType = 'linear';
			option.preparedOptions.withxAxis = false;
		}
	}
	
	function _addPlotOptions(option, chartOpts) {
		option.plotOptions = {
            area: {
                stacking: 'normal',
                lineColor: '#666666',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#666666'
                }
            },
			areaspline: {
                fillOpacity: 0.5
            },
			pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                },
				slicedOffset : 20
				/*,showInLegend: true
                ,startAngle: -90,
                endAngle: 90,
                center: ['50%', '75%'] */
            },
			columnrange: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return this.y;//+ '°C';
                    }
                }
            }
        }
	}
	
	function _addxAxis(option, chartOpts) {
		var preOptions = option.preparedOptions, xAxis = {};
		
		if (preOptions.withxAxis) {
			xAxis.categories = preOptions.catagoriesResult;
		}
		xAxis.type = preOptions.xAxisType;
		option.xAxis = xAxis;
	}
	
	function _addyAxis(option, chartOpts) {
		option.yAxis = {
			title: {
				text: 'customize' //customize
			}
		};
	}
	
	function _addSeries(option, chartOpts) { //Note: four situation about series and xAxis's combination
		var preOptions = option.preparedOptions,
			chartType = chartOpts.chartType || 'line',
			chartDatas = chartOpts.chartDatas || {}, rows = chartDatas.rows || [],
			chartConfig = chartOpts.chartConfig || {},
			xAxes = chartConfig.xAxes || [], xAxisCol = xAxes[0],
			series = chartConfig.series || [], seriesCol = series[0] || '', 
			yAxes = chartConfig.yAxes || [],
			tseries = [], seriesArray = preOptions.seriesResult, categories = preOptions.catagoriesResult;
		
		var aggregate = function (type, leftOper, rightOper) { //This is the default aggregate function for the yAsix value which has the same xAsix value.
			var result = rightOper;
			if (leftOper.length === undefined) {
				result = leftOper + rightOper;
			} else if (leftOper.length === 2) {
				result = [leftOper[0] + rightOper[0], leftOper[1] + rightOper[1]];
			} else if (leftOper.length === 3) {
				result = [leftOper[0] + rightOper[0], leftOper[1] + rightOper[1], leftOper[2] + rightOper[2]];
			}
			return result;
		};
		
		if (preOptions.withSeries) {
			if (preOptions.withxAxis) { //WithSeries && With xAxis, 'result' include all the yAxis values that match the series value and xAxis value; (using aggregate defaultly)
				tseries = _.map(seriesArray, function (value, index, listObj) {
					var i = 0, length = rows.length, temp = {}, result = [], yAxisValue = null, existCatagories = {},
						categoriesJson = $.extend({}, preOptions.catagoriesObj);
					for (; i < length; i++) {
						temp = rows[i];
						if (temp[seriesCol] === value && (temp[xAxisCol] in categoriesJson)) {
							if (yAxes.length === 1) {
								yAxisValue = Number(temp[yAxes[0]]) || 0;
							} else if (yAxes.length === 2) {
								yAxisValue = [Number(temp[yAxes[0]]) || 0, Number(temp[yAxes[1]]) || 0];
							} else {// if (yAxes.length === 3) 
								yAxisValue = [Number(temp[yAxes[0]]) || 0, Number(temp[yAxes[1]]) || 0, Number(temp[yAxes[2]]) || 0];
							}
							categoriesJson[temp[xAxisCol]] = existCatagories[temp[xAxisCol]] ? aggregate('sum', categoriesJson[temp[xAxisCol]], yAxisValue) : yAxisValue; // 这里可以做同一个x值对应的y值的聚合
							existCatagories[temp[xAxisCol]] = true;
						}
					}
					for (var key in categoriesJson) {//Note: be careful for the order of the json loop iteration.
						if (chartType === 'pie') { //Note: use all series's catagories union set, not the each series owner catagories.
							result.push([key, categoriesJson[key]]);
						} else if (chartType === 'columnrange') {
							result.push(categoriesJson[key] && categoriesJson[key].sort());
						} else {
							result.push(categoriesJson[key]);
						}
					}
					
					return {
						name : value,
						data : result
					};
				});
			} else {  //WithSeries && Without xAxis, 'result' include all the yAxis values that match the series value;
				tseries = _.map(seriesArray, function (value, index, listObj) {
					var i = 0, length = rows.length, temp = {}, result = [], yAxisValue = null;
					for (; i < length; i++) {
						temp = rows[i];
						if (temp[seriesCol] === value) {
							if (yAxes.length === 1) {
								yAxisValue = Number(temp[yAxes[0]]) || 0;
							} else if (yAxes.length === 2) {
								yAxisValue = [Number(temp[yAxes[0]]) || 0, Number(temp[yAxes[1]]) || 0];
							} else {// if (yAxes.length === 3) 
								yAxisValue = [Number(temp[yAxes[0]]) || 0, Number(temp[yAxes[1]]) || 0, Number(temp[yAxes[2]]) || 0];
							}
							if (chartType === 'pie') {
								result.push(['value' + i, yAxisValue]); //or result.push(yAxisValue);
							} else if (chartType === 'columnrange') {
								result.push(yAxisValue && yAxisValue.sort());
							} else {
								result.push(yAxisValue);
							}
						}
					}
					
					return {
						name : value,
						data : result
					};
				});
			}
		} else {
			if (preOptions.withxAxis) { //WithoutSeries && With xAxis, 'result' include all the yAxis values that match xAxis value; (using aggregate defaultly)
				var i = 0, length = rows.length, temp = {}, result = [], yAxisValue = null, existCatagories = {},
					categoriesJson = $.extend({}, preOptions.catagoriesObj);
				for (; i < length; i++) {
					temp = rows[i];
					if (temp[xAxisCol] in categoriesJson) {
						if (yAxes.length === 1) {
							yAxisValue = Number(temp[yAxes[0]]) || 0;
						} else if (yAxes.length === 2) {
							yAxisValue = [Number(temp[yAxes[0]]) || 0, Number(temp[yAxes[1]]) || 0];
						} else {// if (yAxes.length === 3) 
							yAxisValue = [Number(temp[yAxes[0]]) || 0, Number(temp[yAxes[1]]) || 0, Number(temp[yAxes[2]]) || 0];
						}
						categoriesJson[temp[xAxisCol]] = existCatagories[temp[xAxisCol]] ? aggregate('sum', categoriesJson[temp[xAxisCol]], yAxisValue) : yAxisValue; // 这里可以做同一个x值对应的y值的聚合
						existCatagories[temp[xAxisCol]] = true;
					}
				}
				for (var key in categoriesJson) { //Note: be careful for the order of the json loop iteration.
					if (chartType === 'pie') {
						result.push([key, categoriesJson[key]]);
					} else if (chartType === 'columnrange') {
						result.push(categoriesJson[key] && categoriesJson[key].sort());
					} else {
						result.push(categoriesJson[key]);
					}
				}
				
				tseries = [
					{
						name : 'none series',
						data : result
					}
				];
			} else {//WithoutSeries && Without xAxis, 'result' include all the yAxis values
				var i = 0, length = rows.length, temp = {}, result = [], yAxisValue = null;
				for (; i < length; i++) {
					temp = rows[i];
					if (yAxes.length === 1) {
						yAxisValue = Number(temp[yAxes[0]]) || 0;
					} else if (yAxes.length === 2) {
						yAxisValue = [Number(temp[yAxes[0]]) || 0, Number(temp[yAxes[1]]) || 0];
					} else {// if (yAxes.length === 3) 
						yAxisValue = [Number(temp[yAxes[0]]) || 0, Number(temp[yAxes[1]]) || 0, Number(temp[yAxes[2]]) || 0];
					}
					if (chartType === 'pie') {
						result.push(['value' + i, yAxisValue]); //or result.push(yAxisValue);
					} else if (chartType === 'columnrange') {
						result.push(yAxisValue && yAxisValue.sort());
					} else {
						result.push(yAxisValue);
					}
				}
				
				tseries = [
					{
						name : 'none series',
						data : result
					}
				];
			}
		}
		
		option.series = tseries;
	}
	
	function _generateOption(chartOpts) {
		var widgetType = chartOpts.widgetType || 'highcharts',
			chartType = chartOpts.chartType || 'line';
		
		var option = $.extend(true, {}, defaultOption);
		option.chart = {type : chartType};
		chartOpts = $.extend(true, {}, chartOpts);
		
		_preprocess(option, chartOpts);
		_prepareOption(option, chartOpts);
		_addPlotOptions(option, chartOpts);
		if (chartType !== 'pie') {
			_addxAxis(option, chartOpts);
			_addyAxis(option, chartOpts);
		}
		_addSeries(option, chartOpts);
		return option;
	}
	
	function renderChart(chartOpts) {
		var container = chartOpts.container,
			chartType = chartOpts.chartType || 'line',
			option = {};
		
		chartOpts.chartDatas = $.extend(true, {}, gsdata.pureData); //test data
		option = _generateOption(chartOpts);
		option.title =  {
			text: chartType + ' Chart: ' + container
		};
		console.dir(option);
		
		$('#' + container).highcharts(option);
	}
	
	return {
		renderChart : renderChart
	};
});