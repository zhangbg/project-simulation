define(['gsdata', 'highcharts', 'underscore'], function (gsdata) {
	var defaultOption = {
		title: {
			text: ''
		},
		credits: {
			enabled: false
		},
		tooltip: {
			valueSuffix: ' customize'
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
			seriesResult = [], catagoriesResult = [], catagoriesObj = {};
			seriesWithCatas = {}, defaultValue = 0;
		
		if (yAxes.length === 2) {
			defaultValue = [0, 0];
		} else if (yAxes.length === 3) {
			defaultValue = [0, 0, 0];
		}
		
		for (; i < length; i++) {
			//Todo : check each column type
			if (seriesCol) {
				temp = list[i];
				seriesColVal = temp[seriesCol];
				existSeries[seriesColVal] || seriesResult.push(seriesColVal);
				existSeries[seriesColVal] = true;
				
				if (xAxisCol) {
					xAxisColVal = temp[xAxisCol];
					existCategories[xAxisColVal] || (catagoriesResult.push(xAxisColVal) && (catagoriesObj[xAxisColVal] = defaultValue));
					existCategories[xAxisColVal] = true;
					if (seriesWithCatas[seriesColVal]) {
						seriesWithCatas[seriesColVal].push(xAxisColVal);
					} else {
						seriesWithCatas[seriesColVal] = [xAxisColVal];
					}
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
				showInLegend: true,
                startAngle: -90,
                endAngle: 90,
                center: ['50%', '75%']
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
	
	function _addSeries(option, chartOpts) {
		var preOptions = option.preparedOptions,
			chartType = chartOpts.chartType || 'line',
			chartDatas = chartOpts.chartDatas || {}, rows = chartDatas.rows || [],
			chartConfig = chartOpts.chartConfig || {},
			xAxes = chartConfig.xAxes || [], xAxisCol = xAxes[0],
			series = chartConfig.series || [], seriesCol = series[0] || '', 
			yAxes = chartConfig.yAxes || [],
			tseries = [], seriesArray = [], categories = [], categoriesJson = '';
		
		if (preOptions.withSeries) {
			seriesArray = preOptions.seriesResult;
			categories = preOptions.catagoriesResult;
			if (preOptions.withxAxis) {
				tseries = _.map(seriesArray, function (value, index, listObj) {
					var i = 0, length = rows.length, temp = {}, result = [], yAxisValue = null;
					categoriesJson = $.extend({}, preOptions.catagoriesObj);
					for (; i < length; i++) {
						temp = rows[i];
						if (temp[seriesCol] === value && (temp[xAxisCol] in categoriesJson)) {
							if (yAxes.length === 1) {
								yAxisValue = temp[yAxes[0]];
							} else if (yAxes.length === 2) {
								yAxisValue = [temp[yAxes[0]], temp[yAxes[1]]];
							} else {// if (yAxes.length === 3) 
								yAxisValue = [temp[yAxes[0]], temp[yAxes[1]], temp[yAxes[2]]];
							}
							categoriesJson[temp[xAxisCol]] = yAxisValue; // 这里可以做同一个x值对应的y值的聚合
						}
					}
					for (var key in categoriesJson) {
						result.push(categoriesJson[key]);
					}
					
					return {
						name : value,
						data : result
					};
				});
			} else {
				
			}
		} else {
		
		}
		
		option.series = tseries;
	}
	
	function _generateOption(chartOpts) {
		var widgetType = chartOpts.widgetType || 'highcharts',
			chartType = chartOpts.chartType || 'line';
		
		var option = $.extend(true, {}, defaultOption);
		option.chart = {type : chartType};
		_prepareOption(option, chartOpts);
		_addPlotOptions(option, chartOpts);
		_addxAxis(option, chartOpts);
		_addyAxis(option, chartOpts);
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
			text: chartType + ' Chart'
		};
		console.dir(option);
		
		$('#' + container).highcharts(option);
	}
	
	return {
		renderChart : renderChart
	};
});