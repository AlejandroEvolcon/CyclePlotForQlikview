Qva.LoadScript('/QvAjaxZfc/QvsViewClient.aspx?public=only&name=Extensions/Evolcon/CyclePlot/d3.min.js', function (){

    Qva.AddExtension('Evolcon/CyclePlot', function(){
	
        Qva.LoadCSS("/QvAjaxZfc/QvsViewClient.aspx?public=only&name=Extensions/Evolcon/CyclePlot/style.css");
        
        //Create reference to the qlikview sheet extension object
        var _this = this;
        var unico = true;
		
        //Get width and height of the qlikview sheet extension object
        var vw = _this.GetWidth();
        var vh = _this.GetHeight();
        
        //Get all data from the qlikview result
        _this.Data.SetPagesize(_this.Data.TotalSize);

        //Set values for presentation
        var margin = {top: 20, right: 20, bottom: 40, left: 40};

		//Set divID
        var divID = "CyclePlot" + new Date().getTime().toString();
               
        //Get Data
        var names = [];
		var values = [];
		var values2 = [];
		var valuesStaging = [];
		var data = [];
		var stgData;
		
		var mainDimension = [];
		var secondaryDimension = [];
		for(var i = 0; i < _this.Data.Rows.length; i++){
			if(mainDimension.indexOf(_this.Data.Rows[i][0].text) < 0){
				mainDimension.push(_this.Data.Rows[i][0].text);
				stgData = { "main": _this.Data.Rows[i][0].text, data: [] };
				data.push(stgData);
			}
			if(secondaryDimension.indexOf(_this.Data.Rows[i][1].text) < 0){
				secondaryDimension.push(_this.Data.Rows[i][1].text);
			}
		}
		
		var w = vw - margin.right - margin.left;
		var h = vh - margin.top - margin.bottom;
				
		var x = d3.scale.ordinal()
			.rangeBands([10, w - margin.right + mainDimension.length], .15)
			.domain(mainDimension);
		var intraDayX = d3.scale.linear()
			.range([0, x.rangeBand()]);
		var y = d3.scale.linear()
			.nice()
			.range([h-20, 0]);
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.tickSize(0);
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickFormat(d3.format("s"));
		var yAxis2 = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickFormat(d3.format("s"))
			.tickSize(w);
		var line = d3.svg.line()
			.x(function(d, i) { return intraDayX(i); })
			.y(function(d,i) { return y(d.expression) + margin.top });
		
		var secondaryScale = d3.scale.ordinal()
							.domain(secondaryDimension)
							.rangePoints([0, x.rangeBand()]);
		
		var secondaryNamesAxis = d3.svg.axis()
							.scale(secondaryScale)
							.orient("bottom");
			
		_this.Element.innerHTML= '<div id=' + divID
                + ' style="width:' + w + 'px;'
                + 'left: 0; position: absolute;'
                + 'top: 0;z-index:999;"></div>';
        
        var chart = d3.select("#" + divID)
                .append("svg")
                .attr("width", w )
                .attr("height", h )
				.attr("transform", "translate( " + margin.left +" ," + margin.top + ")");

		var maxValue = 0.0;
		
		for(var i = 0; i < _this.Data.Rows.length; i++){
			stgData = {"secondary": _this.Data.Rows[i][1].text, "expression": parseFloat(_this.Data.Rows[i][2].data)};
			var temp = mainDimension.indexOf(_this.Data.Rows[i][0].text);
			data[temp].data.push(stgData);
			if(maxValue < parseFloat(_this.Data.Rows[i][2].data)){
				maxValue = parseFloat(_this.Data.Rows[i][2].data);
			}
		}
		
		data.forEach(function(d) {
			d.mean = d3.mean(d.data, function(d) { return d.expression; });
		});
		
		intraDayX.domain([0, secondaryDimension.length-1]);
		y.domain([0, maxValue]);
		
		var namesAxisD = chart.append("g")
					.attr("transform", "translate( " + margin.left +" ," + (h + 30) + ")")
					.attr("class", "xaxis")
					.call(xAxis);
		
		var valuesAxisD = chart.append("g")
					.attr("transform", "translate( " + margin.left +" ," + margin.top + ")")
					.attr("class", "axis")
					.call(yAxis);
					
		var valuesAxisD2 = chart.append("g")
					.attr("transform", "translate( " + (margin.left + w) +" ," + margin.top + ")")
					.attr("class", "yAxisDot")
					.call(yAxis2);
					
		var main = chart.selectAll(".main")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "main")
            .attr("transform", function(d, i) { return "translate(" + (x(mainDimension[i]) + margin.left) + ",0)"; });
		
		main.append("line")
            .attr("class", "mean")
			.attr("stroke", this.Layout.Text0.text)
            .attr("x1", 0)
            .attr("y1", function(d) { return y(d.mean) + margin.top; })
            .attr("x2", x.rangeBand())
            .attr("y2", function(d) { return y(d.mean) + margin.top; });
			
		main.append("path")
            .datum( function(d) { return d.data; })
            .attr("class", "line")
			.attr("stroke", this.Layout.Text0.text)
            .attr("d", line);
			
		main.append("g")
			.attr("transform", "translate( 0 ," + (h) + ")")
			.attr("class", "axis")
			.call(secondaryNamesAxis)
			.selectAll("text")
			.attr("transform", function(d, i){return "translate(" + (mainDimension[i].length * -2.5) + "," + (mainDimension[i].length * 2.0) +")rotate(320)"});
		
		valuesAxisD2.selectAll("g").filter(function(d) { return d; })
					.classed("minor", true);
		
    },true); //End AddExtension

}); //End LoadScript



	
