var defaultTimeline = 144,
    stockCounter = 0,
    flowCounter = 0,
    groupCounter = 0,
    systemCounter = 0,
    stockColor = d3.rgb(0,0,0),
    flowColor = d3.rgb(255,0,0),
    globalSystem= new System();

globalSystem.simulate();


function System(args){
  args = args? args : {};
  this.id = "system_" + systemCounter++;
  this.name = args.name ? args.name : this.id;
  this.periodic = args.periodic ? args.periodic : true; // if true timeline repeats after the end. The pattern is a cycle. Mainly to be used for DelayPipe functions.
  this.timeline = args.timeline ? args.timeline : defaultTimeline;
  this.stocks = args.stocks ? args.stocks : [];
  this.flows = args.flows ? args.flows : [];
  this.groups = args.groups ? args.groups : [];
  this.graphs = args.graphs ? args.graphs : [];
  this.focusGraphs = args.focusGraphs ? args.focusGraphs : [];

  
  this.makeFlow = function(args){
    var flow = new Flow(args);
    this.flows.push(flow);
    return flow;
  }
  this.makeStock = function(args){
    var stock = new Stock(args);
    this.stocks.push(stock);
    return stock;
  }
  this.makeGroup = function(args){
    var group = new Group(args);
    this.groups.push(group);
    return group;
  }
  this.simulate = function(){
    for (var i = 0; i < this.timeline; i++) {
      this.stocks.forEach(function(stock){
        stock.setValue(i);
      });
      this.flows.forEach(function(flow){
       flow.setValue(i);
      });
      this.groups.forEach(function(group){
       group.setValue(i);
      });
    };
  }
  this.reset = function(){ // creates histories of length=this.timeline of flows and stocks filled with initial values for stocks and zeros for flows
    for (var i = 0; i < this.timeline; i++) {
      this.stocks.forEach(function(stock){
        stock.setValue(i, stock.initialize());
      });
      this.flows.forEach(function(flow){
        flow.setValue(i, 0);
      });
    };
  }
  this.addGraph = function(args){
    var graph = chart_BETA(args);
    this.graphs.push(graph);
    return graph;
  }
  this.makeGraph = function(containerDivClass, data, properties){
    var graph = areaGraphCombined(containerDivClass, data, properties);
    this.graphs.push(graph);
    return graph;
  }
  this.updateGraphs = function(updateArgs){
    this.graphs.forEach(function(graph){
      graph.update(updateArgs);
    });
    this.focusGraphs.forEach(function(fGraph){
      fGraph.update(updateArgs);
    });
  }
  this.update = function(timeline){
    this.simulate(timeline);
    this.updateGraphs();
  }
  this.utilities = utilities(this.timeline, this.periodic);
}


function Stock(args){
  args = args? args : {};
  this.id = "stock_" + stockCounter++;
  this.name = args.name ? args.name : this.id;
  this.initVal = 0;
  this.initialize = args.initialize ? args.initialize : function(){ return 0 }; //initialize() stock functions SHOULD BE INDEPENDENT FROM FLOWS.
  this.history = [];
  this.tags = args.tags? args.tags : [];
  this.min = 0;
  this.max = 0;
  this.inFlows = args.inFlows ? args.inFlows : [];
  this.outFlows = args.outFlows ? args.outFlows : [];
  this.getValue = function(tStep){ 
    return this.history[tStep]? this.history[tStep].value : null;
  }
  this.getTargetValue = function(tStep){ 
    return this.history[tStep].targetValue;
  }
  this.setValue = function(tStep, value, targetValue){  
    if (tStep==0) {
      this.history[tStep] = {
        timeStep: tStep, 
        value: value!=null? value : this.initialize(), 
        targetValue: targetValue!=null? targetValue : value!=null? value : this.initialize()
      };
      this.min = this.initialize();
      this.max = this.initialize();
    } else {
      var valueChange = 0;
      var targetValueChange = 0;
      this.inFlows.forEach(function(inFlow){
        valueChange += inFlow.getValue(tStep-1);
        targetValueChange += inFlow.getTargetValue(tStep-1);
      });
      this.outFlows.forEach(function(outFlow){
        valueChange -= outFlow.getValue(tStep-1);
        targetValueChange -= outFlow.getTargetValue(tStep-1);
      });
      this.history[tStep] = {
        timeStep: tStep, 
        value: value!=null? value : this.history[tStep-1].value + valueChange, 
        targetValue: targetValue!=null? targetValue : value!=null? value : this.history[tStep-1].targetValue + targetValueChange
      };
      this.min = Math.min(this.min, this.history[tStep].value);
      this.max = Math.max(this.max, this.history[tStep].value);
    }
  }
  this.reset = function(){
    this.min = 0;
    this.max = 0;
    this.history = [];
  }
  this.styles = args.styles ? args.styles : ["stock"];
  this.color =  args.color ? args.color : stockColor;
  this.fill = args.fill ? args.fill : stockColor;
  this.fillOpacity = args.fillOpacity ? args.fillOpacity : 0.7;
  this.stroke = args.stroke ? args.stroke : d3.rgb(0,0,0);
  this.strokeWidth = args.strokeWidth ? args.strokeWidth : 2;
  globalSystem.stocks.push(this);
}


function Flow(args){
  args = args? args : {};
  this.id = "flow_" + flowCounter++;
  this.name = args.name ? args.name : this.id;
  this.from = args.from;
  this.to = args.to;
  this.history = [];
  this.tags = args.tags? args.tags : [];
  this.expression = args.expression ? args.expression : function(tStep){ return 0 };
  this.targetExpression = args.targetExpression ? args.targetExpression : function(tStep){ return 0 };
  this.getValue = function(tStep){ 
    return this.history[tStep].value;
  }
  this.getTargetValue = function(tStep){ 
    return this.history[tStep].targetValue;
  }
  this.setValue = function(tStep, value, targetValue){
    this.history[tStep] = {
        timeStep: tStep, 
        value:  value!=null? value : this.expression(tStep), 
        targetValue: targetValue!=null? targetValue : value!=null? value : this.targetExpression(tStep),
      };
  }
  this.reset = function(){
    this.history = [];
  }
  this.styles = args.styles ? args.styles : ["flow"];
  this.color =  args.color ? args.color : flowColor;
  this.fillOpacity = args.fillOpacity ? args.fillOpacity : 0.3;
  this.stroke = args.stroke ? args.stroke : d3.rgb(0,0,0);
  this.strokeWidth = args.strokeWidth ? args.strokeWidth : 2;
  globalSystem.flows.push(this);
}



















function Group(args){
  this.id = "group_" + groupCounter++;
  this.name = args.name ? args.name : this.id;
  this.members = args.members? args.members : [];
  this.history = [];
  this.defaultValue = args.defaultValue? args.defaultValue : "mean";
  this.getValue = function(tStep){ 
    return this.history[tStep]? this.history[tStep] : null;
  }


  
  
  this.setValue = function(tStep){  
    var population = [];
    this.members.forEach(function(m){
      for ( i=0; i<m.history[0].value; i++){
        population.push(m.history[tStep].value-m.history[0].value);
      }
    });
    this.history[tStep] = {
      timeStep: tStep, 
      // mean: d3.mean(this.members, function(d){return d.history[tStep].value - d.history[0].value;}),
      // variance: d3.variance(this.members, function(d){return d.history[tStep].value - d.history[0].value;}),
      // deviation: d3.deviation(this.members, function(d){return d.history[tStep].value - d.history[0].value;}),
      // min: d3.min(this.members, function(d){return d.history[tStep].value - d.history[0].value;}),
      // max: d3.max(this.members, function(d){return d.history[tStep].value - d.history[0].value;}),

      // mean: d3.mean(this.members, function(d){return d.history[tStep].value;}),
      // variance: d3.variance(this.members, function(d){return d.history[tStep].value;}),
      // deviation: d3.deviation(this.members, function(d){return d.history[tStep].value;}),
      // min: d3.min(this.members, function(d){return d.history[tStep].value;}),
      // max: d3.max(this.members, function(d){return d.history[tStep].value;}),

      // mean: d3.mean(this.members, function(d){return d.history[0].value * (d.history[tStep].value - d.history[0].value) ;}),
      // variance: d3.variance(this.members, function(d){return d.history[0].value * (d.history[tStep].value - d.history[0].value);}),
      // deviation: d3.deviation(this.members, function(d){return d.history[0].value * (d.history[tStep].value - d.history[0].value);}),
      // min: d3.min(this.members, function(d){return d.history[0].value * (d.history[tStep].value - d.history[0].value);}),
      // max: d3.max(this.members, function(d){return d.history[0].value * (d.history[tStep].value - d.history[0].value);}),

      mean: d3.mean(population),
      variance: d3.variance(population),
      deviation: d3.deviation(population),
      min: d3.min(population),
      max: d3.max(population),

    };
    this.history[tStep].value = this.history[tStep][this.defaultValue];
  }
  this.add = function(member){
    this.members.push(member);
  }
  this.reset = function(){
    this.history = [];
  }
  globalSystem.groups.push(this);
}


function utilities(timeline, periodic){
  return {
    pulse: function (startTime, duration, i) {
      // if (i>=startTime && i< Math.round(startTime+duration) ){
      if (i>=startTime && i< startTime+duration ){
        return  1;
      } else if (i>=0 && i<(startTime - timeline + duration)){
        if (periodic==true)
          return  1 ;
        else
          return 0;
      } else {
        return 0;
      }
    },

    pulseSmooth: function (startTime, duration, T, i) {
      // Similar to pulse, but: signal rises smoothly at start time, then becomes constant, and after the end time it smoothly fades out
      if (i>=startTime + T/2 && i< startTime+duration ){
        return  1;
      } else if (i>=startTime && i<startTime+T/2) {
        return  0.5*( Math.sin(2 * Math.PI * ( i - startTime + 3*T/4 ) / T  ) + 1)  ;
      } 
      else if (i>=startTime + duration && i<startTime + duration + T/2) {
        return  0.5*( Math.sin(2 * Math.PI * ( i - (startTime + duration) + T/4 ) / T  ) + 1)  ;
      }
      else if (i>=0 && i<(startTime - timeline + duration )){
          return  1 ;
      } 
      // else if (i>=0 && i>=(startTime - timeline + duration) && i>=(startTime - timeline + duration + T/2) ){
      //   return  0.5*( Math.sin(2 * Math.PI * ( i - (startTime - timeline + duration) + T/4 ) / T  ) + 1)  ;
      // } 

       else {
        return 0;
      }
    },

    pulseGamma: function (startTime, duration, alpha, beta, i) {
      if (i>=startTime && i<startTime+duration){
        return gamma_pdf( ( i - startTime ) / duration , alpha, beta);
      } else if (i>=0 && i<(startTime - timeline + duration)){
        return gamma_pdf( ( i - startTime + timeline ) / duration , alpha, beta);
      } else {
        return 0;
      }
    },

    pulseTrain: function (startTime, t1, t2, nbPulses, tStep) {
      var pulses=[];
      if ( tStep-startTime>=0 && (tStep-startTime)%(t1+t2)>0 &&  (tStep-startTime)%(t1+t2)<t1  &&  tStep<=startTime+nbPulses*(t1+t2)  ) {
        return 1;
      } else  {
        return 0;
      } 
    },
    pulseSin: function (startTime, duration, i) {
      if (i>=startTime && i<startTime+duration){
        return  ( Math.sin(2 * Math.PI * ( i - startTime - duration/4 ) / duration  ) + 1) / duration  ;
        // return  (1/(duration * Math.sqrt(2*Math.PI) )) * Math.pow(Math.E, - Math.pow(i-(startTime+0.5*duration),2)/(2*Math.pow(duration,2))); // NORMAL DISTRIBUTION EQUATION
      } else if (i>=0 && i<(startTime - timeline + duration)){
        return  ( Math.sin(2 * Math.PI * ( i - startTime + timeline - duration/4 ) / duration  ) + 1) / duration  ;
      } else {
        return 0;
      }
    },
    pulseNormal: function (startTime, duration, i) { // Returns a normal distribution : function implemented from Wikipedia
      if (i>=startTime && i<startTime+duration){
        return  (1/(duration * Math.sqrt(2*Math.PI) )) * Math.pow(Math.E, - Math.pow(i-(startTime+0.5*duration),2)/(2*Math.pow(duration,2))); // NORMAL DISTRIBUTION EQUATION
      } else if (i>=0 && i<(startTime - timeline + duration)){
        return  (1/(duration * Math.sqrt(2*Math.PI) )) * Math.pow(Math.E, - Math.pow(i-(startTime + timeline+0.5*duration),2)/(2*Math.pow(duration,2)));
      } else {
        return 0;
      }
    },
    delayPipe: function (expression, delayTime, tStep){
      if (tStep<delayTime) {
        if(periodic==true) 
          return expression(tStep+timeline-delayTime);  
        else
          return 0;
      } else {
        return expression(tStep-delayTime);    
      }
    },
    delayPipe2: function (flow, delayTime, tStep){
      if (tStep<delayTime) {
        if(periodic==true) 
          return flow.getValue(tStep+timeline-delayTime);  
        else
          return 0;
      } else {
        return flow.getValue(tStep-delayTime);   
      }
    },
    delayPipe3: function (expression, delayTime, type, tStep){
      if (tStep<delayTime) {
        if(type==0) 
          return 0;  
        else if(type==1) 
          return expression(delayTime); 
        else if(type==2) 
          return expression(tStep+timeline-delayTime); 
      } else {
        return expression(tStep-delayTime);    
      }
    },
    integralPulseSin: function (st, T, i) {
      if (st-T/2 < st+T/2){
        if (i <= st-T/2) {
          return 0;
        }
        else if (i <= st+T/2){
          return  (i-(1/2)*T*Math.cos(2*Math.PI*i/T+(1/2)*Math.PI*(-4*st+T)/T)/Math.PI)/T-(1/2)*(2*st-T)/T ;
        } 
        else if (i > st+T/2){
          return  1;
        } 
      } else {
        return 0;
      }
    },
    merge: function(arr){

    }

  }
}







// gamma probability density function (pdf) implemented from  http://bl.ocks.org/ilanman/10602996
function gamma_pdf(x, beta, alpha){

 var gamma = 1;
 for (var i = alpha-1 ; i > 0 ;i --){
  gamma = gamma * i;
 }
 
 numerator = Math.pow(beta,alpha)*Math.pow(x,alpha-1)*Math.exp(-beta*x);
 denominator = gamma;

 return numerator / denominator;
 
}






//Creates a pulse of 1 for a given duration
function pulseArr(startTime, duration, timeline) {
  var result=[];
  for (var i=0; i<timeline; i++){
    result.push(i>=startTime && i<Math.round(startTime+duration) ? 1 : 0);
  }
  return result;
}

function pulse(startTime, duration, timeline, i) {
  if (i>=startTime && i< Math.round(startTime+duration) ){
    return  1;
  } else if (i>=0 && i<(startTime - timeline + duration)){
    return  1 ;
  } else {
    return 0;
  }
}

function pulseTrain(startTime, t1, t2, nbPulses, timeline, tStep) {
  var pulses=[];
  if ( tStep-startTime>=0 && (tStep-startTime)%(t1+t2)>0 &&  (tStep-startTime)%(t1+t2)<t1  &&  tStep<=startTime+nbPulses*(t1+t2)  ) {
    return 1;
  } else  {
    return 0;
  } 
}

// Creates a sinusoidal pulse with an integral area of 1 or of sum (optional)
function pulseSinArr(startTime, duration, timeline) {
  var result=[];
  for (var i=0; i<timeline; i++){
    if (i>=startTime && i< Math.round(startTime+duration)){
      result.push( Math.sin(2 * Math.PI * ( i - startTime - duration/4 ) / duration  ) / duration + 1/duration );
    } else {
      result.push(0);
    }
  }
  return result;
}

function pulseSin(startTime, duration, timeline, i) {
  if (i>=startTime && i<startTime+duration){
    // return  sum * ( Math.sin(2 * Math.PI * ( i - startTime - duration/4 ) / duration  ) / duration + 1/duration ) ;
    return  ( Math.sin(2 * Math.PI * ( i - startTime - duration/4 ) / duration  ) + 1) / duration  ;
  } else if (i>=0 && i<(startTime - timeline + duration)){
    return  ( Math.sin(2 * Math.PI * ( i - startTime + timeline - duration/4 ) / duration  ) + 1) / duration  ;
  } else {
    return 0;
  }
}

function delayPipe(expression, delayTime, timeline, tStep){
  if (tStep<delayTime) {
     // return 0;
    return expression(tStep+timeline-delayTime);  
  } else {
    return expression(tStep-delayTime);    
  }
}

function delayPipe2(flow, delayTime, timeline, tStep){
  if (tStep<delayTime) {
    return flow.getValue(tStep+timeline-delayTime);  
  } else {
    return flow.getValue(tStep-delayTime);   
  }
}







function chart(args){

  var graph={};

  graph.containerDivClass = args.containerDivClass;

  graph.showAxis = args.showAxis? args.showAxis : true;
  graph.showAxis2 = args.showAxis2? args.showAxis2 : true;

  graph.margin = args.margin? args.margin : {top: 15, right: 25, bottom: 15, left: 25};
  // graph.margin = args.margin? args.margin : args.showAxis2? {top: 15, right: 5, bottom: 15, left: 25} : {top: 15, right: 25, bottom: 15, left: 25};

  if (args.margin){
    graph.margin = args.margin;
  } else {
    if (graph.showAxis2==true) {
      graph.margin = {top: 15, right: 25, bottom: 15, left: 25};
    } else {
      graph.margin = {top: 15, right: 5, bottom: 15, left: 25};
    }
  }

  // graph.showAxis = args.showAxis!=null? args.showAxis : true;

  graph.width = parseInt(d3.selectAll("." + args.containerDivClass).style('width')) - graph.margin.left - graph.margin.right;
  graph.height = args.height;

  graph.xDomain = args.xDomain? args.xDomain : [0, d3.max(args.data, function(d) { return d.history.length-1;}) ];

  graph.stackData = args.stack&&args.stack==true? true : false;

  graph.interpolationMode = args.interpolation? args.interpolation : "linear";

  graph.type = args.type? args.type : "area";

  // if (graph.type=="stack"){
  //   graph.stack = d3.layout.stack()
  //     .values(function(d) { return d.history; })  
  //     .x(function(tStep) { return tStep.timeStep;})
  //     .y(function(tStep) { return tStep.value;});
  //   graph.stack(args.data);
  //   graph.yDomain = args.yDomain? args.yDomain : [0, d3.max(args.data, function(d) { return d3.max(d.history, (function(k) { return k.y0 + k.y;}) );})];
  //   graph.area = d3.svg.area()
  //     .interpolate(graph.interpolationMode)
  //     .x(function(d) { return graph.xScale( d.timeStep); })
  //     .y0(function(d) { return graph.yScale(d.y0); })
  //     .y1(function(d) { return graph.yScale(d.y0 + d.y); });
  // } else {
  //   graph.yDomain = args.yDomain? args.yDomain : [0, d3.max(args.data, function(d) { return d3.max(d.history, (function(k) { return k.value;}) );})];
  //   if (graph.type=="area"){
  //   graph.area = d3.svg.area()
  //     .interpolate(graph.interpolationMode)
  //     .x(function(d) { return graph.xScale( d.timeStep); })
  //     .y0(graph.height)
  //     .y1(function(d) { return graph.yScale(d.value);});
  //   } else if (graph.type=="line"){
  //    graph.area = d3.svg.area()
  //     .interpolate(graph.interpolationMode)
  //     .x(function(d) { return graph.xScale( d.timeStep); })
  //     .y(function(d) { return graph.yScale(d.value);});
  //   }
  // }



  if (graph.stackData==true){
    graph.stack = d3.layout.stack()
      .values(function(d) { return d.history; })  
      .x(function(tStep) { return tStep.timeStep;})
      .y(function(tStep) { return tStep.value;});
    graph.stack(args.data);
    graph.yDomain = args.yDomain? args.yDomain : [0, d3.max(args.data, function(d) { return d3.max(d.history, (function(k) { return k.y0 + k.y;}) );})];
    graph.area = d3.svg.area()
      .interpolate(graph.interpolationMode)
      .x(function(d) { return graph.xScale( d.timeStep); })
      .y0(function(d) { return graph.yScale(d.y0); })
      .y1(function(d) { return graph.yScale(d.y0 + d.y); });
  } else {
    graph.yDomain = args.yDomain? args.yDomain : [0, d3.max(args.data, function(d) { return d3.max(d.history, (function(k) { return k.value;}) );})];
    graph.area = d3.svg.area()
      .interpolate(graph.interpolationMode)
      .x(function(d) { return graph.xScale( d.timeStep); })
      .y0(graph.height)
      .y1(function(d) { return graph.yScale(d.value);});
  }
  
  graph.xScale = d3.scale.linear()
    .range([0, graph.width])
    .domain(graph.xDomain); 

  graph.yScale = d3.scale.linear()
      .range([graph.height, 0])
      .domain(graph.yDomain);

  var formatTime = d3.time.format("%H:%M"),
    formatMinutes = function(d) { return formatTime(new Date(2012, 0, 1, 0, d)); };

  graph.timeScale = d3.scale.linear()
    .range([0, graph.width])
    .domain([0, 1440]);  

  graph.xAxis = d3.svg.axis()
      .scale(graph.timeScale)
      .orient("bottom")
      .tickFormat(formatMinutes)
      .ticks(3);

  graph.yAxis = d3.svg.axis()
      .scale(graph.yScale)
      .orient("left")
      .ticks(args.ticks || 4);

  graph.y2Axis = d3.svg.axis()
      .scale(graph.yScale)
      .orient("right")
      .ticks(args.ticks || 4);

  graph.line = d3.svg.area()
      .interpolate(graph.interpolationMode)
      .x(function(d) { return graph.xScale( d.timeStep); })
      .y(function(d) { return graph.yScale(d.value);});

  graph.svg = d3.selectAll("." + args.containerDivClass ).append("svg")
      .attr("class", "svg")
      .attr("width", graph.width + graph.margin.left + graph.margin.right)
      .attr("height", graph.height + graph.margin.top + graph.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + graph.margin.left + "," + graph.margin.top + ")");

  if(graph.showAxis==true){
    graph.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + graph.height + ")")
      .call(graph.xAxis);

    graph.svg.append("g")
      .attr("class", "y axis")
      .call(graph.yAxis);

    if(graph.showAxis2==true){
    graph.svg.append("g")
      .attr("class", "y2 axis")
      .attr("transform", "translate(" + graph.width + " ,0)") 
      .call(graph.y2Axis);
    }
  }

  graph.focusGraphs = [];

  var layers = graph.svg.selectAll(".layer");

  layers.data(args.data) // bind data to layers
    .enter() // get the 'enter' selection (e.g. new empty nodes)
      .append("path")
      .attr("class", "layer " + args.styleClass)
      .attr("d", function(d) { if (args.type=="line") return graph.line(d.history); else return graph.area(d.history);})
      .style("fill", graph.stackData==true? function(d) {if(d.color) return d.color;} : "none")
      .style("stroke", function(d) {if(d.stroke) return d.stroke;})
      .on("click", function (clickedData) {
      });


  graph.update = function update(updateArgs){


    if(graph.stackData==true) {
      // Recompute stack
      graph.stack(args.data); 
      // Rescale Y
      graph.yDomain = args.yDomain? args.yDomain : [0, d3.max(args.data, function(d) { return d3.max(d.history, (function(k) { return k.y0 + k.y;}) );})];
    } else {
      // Rescale Y
      graph.yDomain = args.yDomain? args.yDomain : [0, d3.max(args.data, function(d) { return d3.max(d.history, (function(k) { return k.value;}) );})];
    }
    graph.yScale.domain(graph.yDomain);

    if(updateArgs && updateArgs.transition==true){
      graph.svg.select(".y.axis")
        .transition()
        .call(graph.yAxis);
      graph.svg.select(".y2.axis")
        .transition()
        .call(graph.y2Axis);
    } else {
      graph.svg.select(".y.axis")
        .call(graph.yAxis);
      graph.svg.select(".y2.axis")
        .call(graph.y2Axis);
    }

    var layers = graph.svg.selectAll(".layer");

    //1. Update
    if(updateArgs && updateArgs.transition==true){
    layers.data(args.data) 
      .transition()
      .attr("d", function(d) {return graph.area(d.history);})
    } else {
      layers.data(args.data) 
      .attr("d", function(d) {return graph.area(d.history);})
    }

    //2. Enter
    layers.data(args.data) //select layers (must bind to data, otherwise .enter() and .remove() will not work)
      .enter()
        .append("path")
        .attr("class", "layer " + args.styleClass)
        .attr("d", function(d) { return graph.area(d.history);});

    //3. Exit
    layers.data(args.data) 
      .exit().remove();
  }


  graph.resize = function resize(){
    graph.stack(args.data); // recompute stack for the new propertyName
    graph.yDomain = (function(){return graph.yDomain})();
    graph.yScale.domain(graph.yDomain);
    graph.svg.select(".y.axis")
      .call(graph.yAxis);
    graph.svg.select(".y2.axis")
      .call(graph.y2Axis);

    graph.width = parseInt(d3.selectAll("." + args.containerDivClass).style('width')) - graph.margin.left - graph.margin.right;
    graph.xScale.range([0, graph.width]);
    graph.timeScale.range([0, graph.width]);
    graph.svg.select(".graphSvg").attr("width", graph.width + graph.margin.left + graph.margin.right);
    graph.svg.select(".x.axis")
      .call(graph.xAxis); 
    graph.svg.select(".y2.axis")
      .attr("transform", "translate(" + graph.width + " ,0)")
      .call(graph.y2Axis);
     graph.svg.selectAll("." + styleClass)
      .attr("d", function(d) {return graph.area(d.history)});
  }

  globalSystem.graphs.push(graph);
  return graph;
}

//Currently the one in use
function chart_BETA(args){
  //Adopted from the SD library but improved
  //CANNOT UPDATE WHEN SLIDERS ARE USED - CENTROID DOES NOT WORK IN SD
  //This is an upgrated version of the SD chart function. I must test it there.
  //Works in both files
  //requires history to have the following format {timeStep: 10, value:45}
  //THIS IS THE BEST

  var graph={};

  graph.data = args.data? args.data : {history: minutesRange.map(function(d){return {value:0}})};

  graph.containerDivClass = args.containerDivClass;

  graph.divId = args.divId;

  //Fix this: does div exist? select it. If not, does divId exist? does a html element with the dvid exist? if yes select it. 
  //if not create it. If no divId exists either then create a new element witha default ID
  graph.div = args.div
    ? args.div 
    : args.divId
      ? d3.select("#" + args.divId) 
      : d3.select("#visualizations").append("div").attr("class","row").append("div").attr("class", "twelve columns");


  graph.showAxis = args.showAxis? args.showAxis : true;
  graph.showAxis2 = args.showAxis2? args.showAxis2 : true;

  graph.margin = args.margin? args.margin : {top: 15, right: graph.showAxis2==true? 30 : 5, bottom: 25, left: 30};
  
  graph.width = args.width? args.width : parseInt(d3.selectAll("." + args.containerDivClass).style('width')) - graph.margin.left - graph.margin.right;
  graph.height = args.height? args.height : 80;
  graph.containerWidth = graph.width + graph.margin.left + graph.margin.right;
  graph.containerHeight = graph.height + graph.margin.top + graph.margin.bottom;

  graph.xPos = args.xPos? args.xPos : 0;
  graph.yPos = args.yPos? args.yPos : 0;
  graph.classes = args.classes? args.classes : ["graphClass"];

  //xDomain and xScale MUST BE COMPUTED INSIDE "D" LATER ON. BECAUSE DIFFERENT GRAPHS HAVE THEIR OWN DOMAINS
  graph.xDomain = args.xDomain? args.xDomain : [0, d3.max(graph.data, function(d) { return d.history.length-1;}) ];
  graph.xScale = d3.scale.linear()
      .range([0, graph.width])
      .domain(graph.xDomain); 

  graph.interpolationMode = args.interpolation? args.interpolation : "linear";

  graph.type = args.type? args.type : "area";
  graph.adjustStock = args.adjustStock? args.adjustStock : false;

  graph.stackData = args.stackData&&args.stackData==true? true : false;

  if (graph.stackData==true){
    graph.stack = args.stack? args.stack : d3.layout.stack()
      .values(function(d) { return d.history; })  
      .x(function(tStep) { return tStep.timeStep;})
      .y(function(tStep) { return tStep.value - (function(){return graph.adjustStock==true? tStep.domain[0] : 0;})() });  //.y(function(tStep) { return tStep.value - tStep.domain[0];});
    
    graph.stack(graph.data);

    graph.yDomain = args.yDomain? args.yDomain : [
      Math.min( 0, d3.min(graph.data, function(d) { return d3.min(d.history, (function(k) { return k.y0 + k.y;}) );}) ), 
      d3.max(graph.data, function(d) { return d3.max(d.history, (function(k) { return k.y0 + k.y;}) );})
    ];

    graph.yScale = d3.scale.linear()
        .range([graph.height, 0])
        .domain(graph.yDomain);

    graph.area = d3.svg.area()
      .interpolate(graph.interpolationMode)
      .x(function(d) { return graph.xScale( d.timeStep); })
      .y0(function(d) { return graph.yScale(d.y0); })
      .y1(function(d) { return graph.yScale(d.y0 + d.y); });
    
    graph.line = d3.svg.area()
      .interpolate(graph.interpolationMode)
      .x(function(d) { return graph.xScale( d.timeStep); })
      .y(function(d) { return graph.yScale(d.y0 + d.y);});
  } else {
    graph.yDomain = args.yDomain? args.yDomain : [
      Math.min( 0, d3.min(graph.data, function(d) { return d3.min(d.history, (function(k) { return k.value;}) );}) ), //Min of Min domain
      d3.max(graph.data, function(d) { return d3.max(d.history, (function(k) { return k.value;}) );})  // Max of Max domain
    ];

    graph.yScale = d3.scale.linear()
        .range([graph.height, 0])
        .domain(graph.yDomain);

    graph.area = d3.svg.area()
      .interpolate(graph.interpolationMode)
      .x(function(d) { return graph.xScale( d.timeStep); })
      // .y0(graph.yScale(args.y0? args.y0 : 0))
      .y0(function(d) { return graph.yScale(d.y0? d.y0 : 0);})
      .y1(function(d) { return graph.yScale(d.value);});
    
    graph.line = d3.svg.area()
      .interpolate(graph.interpolationMode)
      .x(function(d) { return graph.xScale( d.timeStep); })
      .y(function(d) { return graph.yScale(d.value);});
  }
  
  

  graph.timeScale = d3.time.scale()
    .range([0, graph.width])
    .domain([0,24]); 

  graph.xAxis = d3.svg.axis()
      .scale(graph.timeScale)
      .orient("bottom")
      .tickFormat(function(d) { return d3.time.format("%H:%M")(new Date(2012, 0, 1, d)); })
      .ticks(6);

  graph.yAxis = d3.svg.axis()
      .scale(graph.yScale)
      .orient("left")
      .ticks(args.ticks || 4);

  graph.y2Axis = d3.svg.axis()
      .scale(graph.yScale)
      .orient("right")
      .ticks(args.ticks || 4);



  graph.svg = args.svg? args.svg : d3.selectAll("." + args.containerDivClass ).append("svg")
    .attr("class", "svg")
    .attr("preserveAspectRatio", "xMinYMin meet") // required for resizing - see more here: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
    .attr("viewBox", "0 0 " + graph.containerWidth + " " + graph.containerHeight)
    .attr("width", "100%")
    .attr("height", "100%");

  graph.svg = graph.svg
      .append("g")
      .attr("class", graph.classes.join(" "))
      .attr("transform", "translate(" + (graph.xPos + graph.margin.left) + "," + (graph.yPos + graph.margin.top) + ")");


  graph.tip = d3.selectAll("." + args.containerDivClass ).append("div")
      .attr("class", "tooltip")               
      .style("opacity", 0);
    

  if(graph.showAxis==true){
    graph.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + graph.height + ")")
    // .attr("transform", "translate(0," + graph.yScale(0) + ")")
    // .attr("transform", "translate(0," + graph.yScale( graph.yDomain[0]  ) + ")")
    .call(graph.xAxis);

    graph.svg.append("g")
    .attr("class", "y axis")
    .call(graph.yAxis);

    if(graph.showAxis2==true){
    graph.svg.append("g")
    .attr("class", "y2 axis")
    .attr("transform", "translate(" + graph.width + " ,0)") 
    .call(graph.y2Axis);
    }
  }


  graph.focusGraphs = [];

  graph.layers = graph.svg.selectAll(".layer");
  graph.stats = graph.svg.selectAll(".stats");

  graph.layers.data(graph.data) // bind data to layers
    .enter() // get the 'enter' selection (e.g. new empty nodes)
      .append("path")
      .attr("class", "layer " + args.styleClass)
      // .attr("clip-path", function(d){ "url(#" + d.clipPathId + " )" })
      .attr("d", function(d) { 
        //COMPUTE xSCALE FIRST
        graph.xDomain =  [0,  d.history.length-1];
        graph.xScale = d3.scale.linear()
              .range([0, graph.width])
              .domain(graph.xDomain); 
        return d.type=="line"? graph.line(d.history) : graph.area(d.history);
      })
      .style("fill", function(d) {return d.fill? d.fill : d3.rgb(50,75,100) })
      .style("fill-opacity", function(d) {return d.fillOpacity? d.fillOpacity : 1 })
      .style("stroke", function(d) {return d.stroke? d.stroke : d3.rgb(200,200,200) }) 
      .style("stroke-opacity", function(d) {return d.strokeOpacity? d.strokeOpacity : 1 })
      .style("stroke-width",  function(d) {return d.strokeWidth? d.strokeWidth : 0.5 })
      .style("stroke-linecap",  function(d) {return d.strokeLineCap? d.strokeLineCap : "butt" })
      // .style("stroke-dasharray", ("8, 8"))
      .style("stroke-dasharray", function(d){ return d.strokeDasharray})
      .on("mouseover", function (d) {
          d3.select(this)
            .style("fill-opacity", function(d) {return d.mouseOverOpacity? d.mouseOverOpacity : 0.5 })
            .style("stroke-width",  function(d) { return d.type=="line"? 2 : 1});

          // graph.tip
          //   // .transition()        
          //   //   .duration(200)      
          //     .style("opacity", .9);      
          // graph.tip.html("HELLO " + d.name)  
          //     .style("left", "30px")     
          //     .style("top", "50px"); 
        }) 
      .on("mouseout", function (d) {
          d3.select(this)
          .style("fill-opacity", function(d) {return d.fillOpacity? d.fillOpacity : 1 })
          .style("stroke-width",  function(d) {return d.strokeWidth? d.strokeWidth : 0.5 });

          graph.tip
            // .transition()        
            //     .duration(500)      
                .style("opacity", 0); 
      })
      .on("click", function (clickedData) {
      });


  // APPEND CENTROID
  if(args.centroid&&args.centroid==true){
    graph.stats.data(args.data) // bind data to layers
      .enter() // get the 'enter' selection (e.g. new empty nodes)
        .append("circle")
        .attr("class", "stats")
        .attr("cx",  function(d){ 
          var mass = d3.sum(d.history, function(tStep,i){return tStep.value});  // args.data.history.length
          if(mass>0){
            var xCor = d3.sum(d.history, function(tStep,i){return tStep.value * i}) / mass;
            return graph.xScale(xCor)
          } else return 0;
        })
        .attr("cy",  function(d){ 
          var mass = d3.sum(d.history, function(tStep,i){return tStep.value});  // args.data.history.length
          var yCor = mass / d.history.length;
          return graph.yScale(yCor)
        })
        .attr("r", function(d){return d.centroidRadius? d.centroidRadius : 4})
        .style("fill", function(d){return d.centroidColor? d.centroidColor : d.stroke})
        .style("fill-opacity", 1)
        .style("stroke-width", 0);

    graph.stats.data(args.data) // bind data to layers
      .enter() // get the 'enter' selection (e.g. new empty nodes)
        .append("circle")
        .attr("class", "stats")
        .attr("cx",  function(d){ 
          var mass = d3.sum(d.history, function(tStep,i){return tStep.value});  // args.data.history.length
          if(mass>0){
            var xCor = d3.sum(d.history, function(tStep,i){return tStep.value * i}) / mass;
            return graph.xScale(xCor)
          } else return 0;
        })
        .attr("cy",  function(d){ 
          var mass = d3.sum(d.history, function(tStep,i){return tStep.value});  // args.data.history.length
          var yCor = mass / d.history.length;
          return graph.yScale(yCor)
        })
        .attr("r", 9)
        .style("fill", "none")
        .style("fill-opacity", 0)
        .style("stroke", function(d){return d.centroidColor? d.centroidColor : d.stroke})
        .style("stroke-width", 1);
  }

  graph.update = function update(updateArgs){

    if(graph.stackData==true) {
      // Recompute stack
      graph.stack(graph.data); 
      // Rescale Y
      // graph.yDomain = args.yDomain? args.yDomain : [0, d3.max(args.data, function(d) { return d3.max(d.history, (function(k) { return k.y0 + k.y;}) );})];
      graph.yDomain = graph.yDomain? graph.yDomain : [
        Math.min( 0, d3.min(graph.data, function(d) { return d3.min(d.history, (function(k) { return k.y0 + k.y;}) );}) ), 
        d3.max(graph.data, function(d) { return d3.max(d.history, (function(k) { return k.y0 + k.y;}) );})
      ];
    } else {
      // Rescale Y
      // graph.yDomain = args.yDomain? args.yDomain : [0, d3.max(graph.data, function(d) { return d3.max(d.history, (function(k) { return k.value;}) );})];
      graph.yDomain = args.yDomain? args.yDomain : [
        Math.min( 0, d3.min(graph.data, function(d) { return d3.min(d.history, (function(k) { return k.value;}) );}) ), //Min of Min domain
        d3.max(graph.data, function(d) { return d3.max(d.history, (function(k) { return k.value;}) );})  // Max of Max domain
      ];
    }
    graph.yScale.domain(graph.yDomain);

    if(updateArgs && updateArgs.transition==true){
      graph.svg.select(".y.axis")
        .transition()
        .call(graph.yAxis);
      graph.svg.select(".y2.axis")
        .transition()
        .call(graph.y2Axis);
    } else {
      graph.svg.select(".y.axis")
        .call(graph.yAxis);
      graph.svg.select(".y2.axis")
        .call(graph.y2Axis);
    }

    graph.layers = graph.svg.selectAll(".layer");
    graph.stats = graph.svg.selectAll(".stats");

    //1. Update
    if(updateArgs && updateArgs.transition==true){
      graph.layers.data(graph.data) 
        .transition()
        .attr("d", function(d) { 
          //COMPUTE xSCALE FIRST
          graph.xDomain =  [0,  d.history.length-1];
          graph.xScale = d3.scale.linear()
                .range([0, graph.width])
                .domain(graph.xDomain); 
          return d.type=="line"? graph.line(d.history) : graph.area(d.history);
        });

      graph.stats.data(graph.data)
        .transition()
        .attr("cx",  function(d){ 
          var mass = d3.sum(d.history, function(tStep,i){return tStep.value});  // args.data.history.length
          if(mass>0){
            var xCor = d3.sum(d.history, function(tStep,i){return tStep.value * i}) / mass;
            return graph.xScale(xCor)
          } else return 0;
        })
        .attr("cy",  function(d){ 
          var mass = d3.sum(d.history, function(tStep,i){return tStep.value});  // args.data.history.length
          var yCor = mass / d.history.length;
          return graph.yScale(yCor)
        });
    } else {
      graph.layers.data(graph.data) 
      .attr("d", function(d) { 
        //COMPUTE xSCALE FIRST
        graph.xDomain =  [0,  d.history.length-1];
        graph.xScale = d3.scale.linear()
              .range([0, graph.width])
              .domain(graph.xDomain); 
        return d.type=="line"? graph.line(d.history) : graph.area(d.history);
      });
      graph.stats.data(graph.data)
        .attr("cx",  function(d){ 
          var mass = d3.sum(d.history, function(tStep,i){return tStep.value});  // args.data.history.length
          if(mass>0){
            var xCor = d3.sum(d.history, function(tStep,i){return tStep.value * i}) / mass;
            return graph.xScale(xCor)
          } else return 0;
        })
        .attr("cy",  function(d){ 
          var mass = d3.sum(d.history, function(tStep,i){return tStep.value});  // args.data.history.length
          var yCor = mass / d.history.length;
          return graph.yScale(yCor)
        });
    }

    //2. Enter
    graph.layers.data(graph.data) //select layers (must bind to data, otherwise .enter() and .remove() will not work)
      .enter()
        .append("path")
        .attr("class", "layer " + args.styleClass)
        .attr("d", function(d) { return d.type=="line"? graph.line(d.history) : graph.area(d.history);});

    //3. Exit
    graph.layers.data(graph.data) 
      .exit().remove();
  }


  // graph.resize = function resize(){
  //   graph.stack(args.data); // recompute stack for the new propertyName
  //   graph.yDomain = (function(){return graph.yDomain})();
  //   graph.yScale.domain(graph.yDomain);
  //   graph.svg.select(".y.axis")
  //     .call(graph.yAxis);
  //   graph.svg.select(".y2.axis")
  //     .call(graph.y2Axis);

  //   graph.width = parseInt(d3.selectAll("." + args.containerDivClass).style('width')) - graph.margin.left - graph.margin.right;
  //   graph.xScale.range([0, graph.width]);
  //   graph.timeScale.range([0, graph.width]);
  //   graph.svg.select(".graphSvg").attr("width", graph.width + graph.margin.left + graph.margin.right);
  //   graph.svg.select(".x.axis")
  //     .call(graph.xAxis); 
  //   graph.svg.select(".y2.axis")
  //     .attr("transform", "translate(" + graph.width + " ,0)")
  //     .call(graph.y2Axis);
  //    graph.svg.selectAll("." + styleClass)
  //     .attr("d", function(d) {return graph.area(d.history)});
  // }

  return graph;
}
//chart_THETA USES VALUE - No timesteps
//Should be a cleaner version than chart_BETA


function chart_THETA(args){

  //Either provide an SVG and find the container div or provide a container div and append an svg
  
  var graph={};

  graph.data = args.data? args.data : {history: minutesRange.map(function(d){return {value:0}})};
  
  graph.divId = args.divId;

  // graph.divId = args.divId? args.divId : args.containerDiv.attr("id");

  graph.containerDivClass = args.containerDivClass;

  // graph.containerDiv = args.containerDiv? args.containerDiv : args.divId? d3.select("#" + args.divId) : d3.select("#visualizations").append("div").attr("class","row").append("div").attr("class", "twelve columns");
  graph.containerDiv = args.containerDiv? args.containerDiv : d3.select("#visualizations").append("div").attr("class","row").append("div").attr("class", "twelve columns");

  // graph.containerDiv = args.containerDiv? args.containerDiv : d3.selectAll("." + args.containerDivClass );


  graph.showAxis = true;
  graph.showAxis2 = args.showAxis2 || false;
  graph.centroid = args.centroid? args.centroid : false;

  graph.transition = args.transition? args.transition : false; // determne whether graphs animate during transitions
  graph.transitionDuration = args.transitionDuration? args.transitionDuration : 0; // determne whether graphs animate during transitions

  graph.margin = args.margin? args.margin : {top: 15, right: graph.showAxis2==true? 30 : 5, bottom: 25, left: 30};

  graph.containerWidth = parseInt(graph.containerDiv.style('width'));
  graph.width = args.width? args.width : graph.containerWidth - graph.margin.left - graph.margin.right;
  graph.height = args.height? args.height : 100;
  graph.containerHeight = graph.height + graph.margin.top + graph.margin.bottom;
  
  graph.xPos = args.xPos? args.xPos : 0;
  graph.yPos = args.yPos? args.yPos : 0;
  graph.classes = args.classes? args.classes : ["graph"];

  //xDomain and xScale MUST BE COMPUTED INSIDE "D" LATER ON. BECAUSE DIFFERENT GRAPHS HAVE THEIR OWN DOMAINS
  graph.xDomain = args.xDomain? args.xDomain : [0, d3.max(graph.data, function(d) { return d.history.length-1;}) ];
  graph.xScale = d3.scale.linear()
      .range([0, graph.width])
      .domain(graph.xDomain); 

  graph.interpolationMode = args.interpolation? args.interpolation : "linear";

  graph.type = args.type? args.type : "area";

  graph.stackData = args.stackData&&args.stackData==true? true : false;

  graph.stack = args.stack? args.stack : d3.layout.stack();
  graph.area = d3.svg.area();
  graph.line = d3.svg.area();
  graph.yScale = d3.scale.linear();
  graph.timeScale = d3.time.scale();
  graph.xAxis = d3.svg.axis();
  graph.yAxis = d3.svg.axis();
  graph.y2Axis = d3.svg.axis();

  if (graph.stackData==true){
    graph.stack
      .values(function(d) { return d.history; })  
      .x(function(tStep,i) { return i})
      .y(function(tStep) { return tStep.value }); 
    
    graph.stack(graph.data);

    graph.yDomain = args.yDomain? args.yDomain : [
      Math.min( 0, d3.min(graph.data, function(d) { return d3.min(d.history, (function(k) { return k.y0 + k.y;}) );}) ), 
      d3.max(graph.data, function(d) { return d3.max(d.history, (function(k) { return k.y0 + k.y;}) );})
    ];

    graph.yScale
        .range([graph.height, 0])
        .domain(graph.yDomain);

    graph.area
      .interpolate(graph.interpolationMode)
      .x(function(d,i) { return graph.xScale( i); })
      .y0(function(d) { return graph.yScale(d.y0); })
      .y1(function(d) { return graph.yScale(d.y0 + d.y); });
    
    graph.line
      .interpolate(graph.interpolationMode)
      .x(function(d,i) { return graph.xScale( i); })
      .y(function(d) { return graph.yScale(d.y0 + d.y);});
  } else {
    graph.yDomain = args.yDomain? args.yDomain : [
      Math.min( 0, d3.min(graph.data, function(d) { return d3.min(d.history, (function(k) { return k.value;}) );}) ), //Min of Min domain
      d3.max(graph.data, function(d) { return d3.max(d.history, (function(k) { return k.value;}) );})  // Max of Max domain
    ];

    graph.yScale
        .range([graph.height, 0])
        .domain(graph.yDomain);

    graph.area
      .interpolate(graph.interpolationMode)
      .x(function(d,i) { return graph.xScale( i); })
      // .y0(graph.yScale(args.y0? args.y0 : 0))
      .y0(function(d) { return graph.yScale(d.y0? d.y0 : 0);})
      .y1(function(d) { return graph.yScale(d.value);});
    
    graph.line
      .interpolate(graph.interpolationMode)
      .x(function(d,i) { return graph.xScale( i); })
      .y(function(d) { return graph.yScale(d.value);});
  }
  

  graph.timeScale
    .range([0, graph.width])
    .domain([0,24]); 

  graph.xAxis
      .scale(graph.timeScale)
      .orient("bottom")
      .tickFormat(function(d) { return d3.time.format("%H:%M")(new Date(2012, 0, 1, d)); })
      .ticks(6);

  graph.yAxis
      .scale(graph.yScale)
      .orient("left")
      .ticks(args.ticks || 4);

  graph.y2Axis
      .scale(graph.yScale)
      .orient("right")
      .ticks(args.ticks || 4);


  graph.svg = args.svg? args.svg : graph.containerDiv.append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet") // required for resizing - see more here: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
    .attr("viewBox", "0 0 " + graph.containerWidth + " " + graph.containerHeight)
    .attr("width", "100%")
    .attr("height", "100%");

  graph.svg = graph.svg
      .append("g")
      .attr("class", "svg " + graph.classes.join(" "))
      .attr("transform", "translate(" + (graph.xPos + graph.margin.left) + "," + (graph.yPos + graph.margin.top) + ")");

  graph.tip = graph.containerDiv.append("div")
      .attr("class", "tooltip")               
      .style("opacity", 0);


  if(graph.showAxis==true){
    graph.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + graph.height + ")")
    // .attr("transform", "translate(0," + graph.yScale(0) + ")")
    // .attr("transform", "translate(0," + graph.yScale( graph.yDomain[0]  ) + ")") 
    .call(graph.xAxis);
    // .selectAll("text")  
    //     .attr("dy", ".1em");

    graph.svg.append("g")
    .attr("class", "y axis")
    .call(graph.yAxis);
    // .selectAll("text")  
    //     .attr("dy", ".1em");

    if(graph.showAxis2==true){
    graph.svg.append("g")
    .attr("class", "y2 axis")
    .attr("transform", "translate(" + graph.width + " ,0)") 
    .call(graph.y2Axis);
    // .selectAll("text")  
    //     .attr("dy", ".1em");
    }
  }

  





  graph.update = function (updateArgs){

    if(graph.stackData==true)
        graph.stack(graph.data); 

    // Rescale Y
    graph.yDomain = args.yDomain? args.yDomain : [
      Math.min( 0, d3.min(graph.data, function(d) { return d3.min(d.history, (function(k) { return graph.stackData==true? k.y0 + k.y : k.value ;}) );}) ), 
      d3.max(graph.data, function(d) { return d3.max(d.history, (function(k) { return graph.stackData==true? k.y0 + k.y : k.value ;}) );})
    ];
    graph.yScale
      .domain(graph.yDomain);
    graph.svg.select(".y.axis")
      // .transition()
      // .duration(graph.transitionDuration)
      .call(graph.yAxis);
      // .selectAll("text")  
      //   .attr("dy", ".1em");
    graph.svg.select(".y2.axis")
      // .transition()
      // .duration(graph.transitionDuration)
      .call(graph.y2Axis);
      // .selectAll("text")  
      //   .attr("dy", ".1em");


    graph.layers = graph.svg.selectAll(".layer")
      .data(graph.data);

    graph.stats = graph.svg.selectAll(".stats")
      .data(graph.data);
    

    //1. Update Layers
    graph.layers
      // .transition()
      // .duration(graph.transitionDuration)
      .attr("class", function(d){ return d.styles? "layer " + d.styles.join(" ") :  "layer"} )
      .attr("d", function(d) { 
        graph.xDomain =  [0,  d.history.length-1];
        graph.xScale
          .range([0, graph.width])
          .domain(graph.xDomain); 
        return d.type=="line"? graph.line(d.history) : graph.area(d.history);
      });

    //1. Update Centroids
    if(graph.centroid==true)
      graph.stats
        // .transition()
        // .duration(graph.transitionDuration)
        .attr("cx",  function(d){ 
          var mass = d3.sum(d.history, function(d){return graph.stackData==true? d.y0 + d.y : d.value });  // graph.data.history.length
          if(mass>0){
            var xCor = d3.sum(d.history, function(d,i){return (graph.stackData==true? d.y0 + d.y : d.value) * i}) / mass;
            return graph.xScale(xCor)
          } else return 0;
        })
        .attr("cy",  function(d){ 
          var mass = d3.sum(d.history, function(d){return graph.stackData==true? d.y0 + d.y : d.value});  // graph.data.history.length
          var yCor = mass / d.history.length;
          return graph.yScale(yCor)
        });


    //2. Enter
    graph.layers
      .enter()  // get the 'enter' selection (e.g. new empty nodes) - if initializing then all nodes are empty =]
        .append("path")
        .attr("class", function(d){ return d.styles? "layer " + d.styles.join(" ") :  "layer"} )
        // .transition()
        // .duration(graph.transitionDuration)
        .attr("d", function(d) { 
          graph.xDomain =  [0,  d.history.length-1];
          graph.xScale
            .range([0, graph.width])
            .domain(graph.xDomain); 
          return d.type=="line"? graph.line(d.history) : graph.area(d.history);
        });
      graph.layers
        //Optional style customizations override CSS style classes
        .style("fill", function(d) {return d.fill})
        .style("fill-opacity", function(d) {return d.fillOpacity})
        .style("stroke", function(d) {return d.stroke}) 
        .style("stroke-opacity", function(d) {return d.strokeOpacity})
        .style("stroke-width",  function(d) {return d.strokeWidth})
        .style("stroke-linecap",  function(d) {return d.strokeLineCap })
        .style("stroke-dasharray", function(d){ return d.strokeDasharray})
        .on("mouseover", function (d) {
            d3.select(this)
              .style("fill-opacity", function(d) {return d.mouseOverOpacity? d.mouseOverOpacity : 0.5 })
              .style("stroke-width",  function(d) { return d.type=="line"? 2 : 1});

                  // graph.tip
                  //   .style("opacity", .9);      
                  // graph.tip.html("HELLO " + d.name)  
                  //     .style("left", "30px")     
                  //     .style("top", "50px"); 
              }) 
            .on("mouseout", function (d) {
              d3.select(this)
                .style("fill-opacity", function(d) {return d.fillOpacity? d.fillOpacity : 1 })
                .style("stroke-width",  function(d) {return d.strokeWidth? d.strokeWidth : 0.5 });

                // graph.tip
                //     .style("opacity", 0);
            })
            .on("click", function (clickedData) {
                d3.select(this)
            }); 

    // ENTER CENTROID
    if(graph.centroid==true)
      graph.stats
        .enter() 
            .append("circle")
            .attr("class", "stats centroid")
            // .transition()
            // .duration(graph.transitionDuration)
            .attr("cx",  function(d){ 
              var mass = d3.sum(d.history, function(d){return graph.stackData==true? d.y0 + d.y : d.value });  // graph.data.history.length
              if(mass>0){
                var xCor = d3.sum(d.history, function(d,i){return (graph.stackData==true? d.y0 + d.y : d.value) * i}) / mass;
                return graph.xScale(xCor)
              } else return 0;
            })
            .attr("cy",  function(d){ 
              var mass = d3.sum(d.history, function(d){return graph.stackData==true? d.y0 + d.y : d.value});  // graph.data.history.length
              var yCor = mass / d.history.length;

              return graph.yScale(yCor)
            })
            .attr("r", function(d){return d.centroidRadius })
            .style("fill", function(d){return d.centroidColor });


    //3. Exit
    graph.layers
      .exit()
        .transition()
        .duration(graph.transition)
        .remove();

    if(graph.centroid==true)
      graph.stats
      .exit()
        // .transition()
        // .duration(graph.transitionDuration)
        .remove();

     // d3.timer.flush();

  }

  graph.update();

  return graph;
}









/**** UTILITIES ****/
function addHistories(objectArr, newName){
    return d3.nest()
    .key(function(){return newName})
    .entries(d3.range(objectArr[0].history.length))
    .map(function(result){ 
      return { 
        name: result.key,
        history: result.values.map(function(tStep,i){
          return {
            timeStep: tStep,
            value: d3.sum(objectArr, function(d){
            return d.history[i].value;
            })
          }
        })
      }
    })[0];
  }


