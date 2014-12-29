require.config({
    baseUrl: "src/script/",
    map: {
        '*': {
            'css': 'plugins/css.min' // or whatever the path to require-css is
        }
    },
    paths: {
        "jquery": "plugins/jquery-1.10.2.min",
        "jquery-migrate": "plugins/jquery-migrate-1.2.1.min",
        "jquery-ui": "plugins/jquery-ui/jquery-ui-1.10.3.custom.min",
        "bootstrap": "plugins/bootstrap/js/bootstrap.min",
		"underscore": "plugins/underscore-min",
        "highcharts": "plugins/highcharts-4.0.4/highcharts",
        "exporting": "plugins/highcharts-4.0.4/modules/exporting",
        //self script
		"gscharts": "common/gscharts",
		"gsdata": "common/gsdata"
    },
    shim: {
        "jquery-migrate": ["jquery"],
        "jquery-ui":["jquery"],
        "bootstrap": ["jquery"],
        "exporting": ["highcharts"]
    },
    priority: [
        "jquery"
    ]
});
//window.name = "NG_DEFER_BOOTSTRAP!";
require([
    "jquery",
	"gscharts",
    "jquery-migrate",
    "jquery-ui",
    "bootstrap",
	"highcharts"
], function (jquery, gscharts) {
	console.dir(jquery);
	var widgets = { //Facked Data: related with dashboard and nth-column layout
		column : 3,
		records : [
			{id : 'widget_2014_01', 'x' : 0, 'y' : 0, 'width' : 1, 'height' : 2, widgetType : 'highcharts', chartType : 'line', chartDatas : []},
			{id : 'widget_2014_01_2', 'x' : 0, 'y' : 0, 'width' : 1, 'height' : 2, widgetType : 'highcharts', chartType : 'line', chartDatas : []},
			{id : 'widget_2014_01_3', 'x' : 0, 'y' : 0, 'width' : 1, 'height' : 2, widgetType : 'highcharts', chartType : 'line', chartDatas : []},
			{id : 'widget_2014_01_4', 'x' : 0, 'y' : 0, 'width' : 1, 'height' : 2, widgetType : 'highcharts', chartType : 'line', chartDatas : []},
			{id : 'widget_2014_02', 'x' : 0, 'y' : 2, 'width' : 1, 'height' : 2, widgetType : 'highcharts', chartType : 'spline', chartDatas : []},
			{id : 'widget_2014_03', 'x' : 1, 'y' : 0, 'width' : 1, 'height' : 2, widgetType : 'highcharts', chartType : 'bar', chartDatas : []},
			{id : 'widget_2014_04', 'x' : 2, 'y' : 0, 'width' : 1, 'height' : 2, widgetType : 'highcharts', chartType : 'column', chartDatas : []},
			{id : 'widget_2014_05', 'x' : 1, 'y' : 2, 'width' : 1, 'height' : 2, widgetType : 'highcharts', chartType : 'area', chartDatas : []},
			{id : 'widget_2014_06', 'x' : 2, 'y' : 2, 'width' : 1, 'height' : 2, widgetType : 'highcharts', chartType : 'areaspline', chartDatas : []},
			{id : 'widget_2014_07', 'x' : 0, 'y' : 4, 'width' : 1, 'height' : 2, widgetType : 'highcharts', chartType : 'pie', chartDatas : []},
			{id : 'widget_2014_07_2', 'x' : 0, 'y' : 4, 'width' : 1, 'height' : 2, widgetType : 'highcharts', chartType : 'pie', chartDatas : []},
			{id : 'widget_2014_07_3', 'x' : 0, 'y' : 4, 'width' : 1, 'height' : 2, widgetType : 'highcharts', chartType : 'pie', chartDatas : []},
			{id : 'widget_2014_07_4', 'x' : 0, 'y' : 4, 'width' : 1, 'height' : 2, widgetType : 'highcharts', chartType : 'pie', chartDatas : []}
		],
		config : {
			'widget_2014_01' : {'xAxes' : ['browser'], 'yAxes' : ['pv'], 'series' : ['device']}, // n-th column name
			'widget_2014_01_2' : {'xAxes' : [], 'yAxes' : ['pv'], 'series' : ['device']}, // n-th column name
			'widget_2014_01_3' : {'xAxes' : ['browser'], 'yAxes' : ['pv'], 'series' : []}, // n-th column name
			'widget_2014_01_4' : {'xAxes' : [], 'yAxes' : ['pv'], 'series' : []}, // n-th column name
			'widget_2014_02' : {'xAxes' : ['browser'], 'yAxes' : ['pv'], 'series' : ['device']},
			'widget_2014_03' : {'xAxes' : ['browser'], 'yAxes' : ['pv'], 'series' : ['device']},
			'widget_2014_04' : {'xAxes' : ['browser'], 'yAxes' : ['pv'], 'series' : ['device']},
			'widget_2014_05' : {'xAxes' : ['browser'], 'yAxes' : ['pv'], 'series' : ['device']},
			'widget_2014_06' : {'xAxes' : ['browser'], 'yAxes' : ['pv'], 'series' : ['device']},
			'widget_2014_07' : {'xAxes' : ['browser'], 'yAxes' : ['pv'], 'series' : ['device']},
			'widget_2014_07_2' : {'xAxes' : [], 'yAxes' : ['pv'], 'series' : ['device']},
			'widget_2014_07_3' : {'xAxes' : ['browser'], 'yAxes' : ['pv'], 'series' : []},
			'widget_2014_07_4' : {'xAxes' : [], 'yAxes' : ['pv'], 'series' : []}
		}
	};
	var i = 0, records = widgets.records || [], length = records.length, temp = null, tpl = '';
	for (; i < length; i++) {
		temp = records[i];
		//render custom widget
		var chartOpts = {
			container : temp.id, 
			widgetType : temp.widgetType,
			chartType : temp.chartType,
			chartDatas : temp.chartDatas,
			chartConfig : widgets.config[temp.id]
		};
		gscharts.renderChart(chartOpts);
	}
});