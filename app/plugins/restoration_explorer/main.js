define([
        "dojo/_base/declare",
		"framework/PluginBase",
		
		"esri/request",
		"esri/layers/ArcGISImageServiceLayer",
		"esri/layers/ImageServiceParameters",
		"esri/layers/RasterFunction",
		"dijit/form/Button",
		"dijit/form/DropDownButton",
		"dijit/DropDownMenu", 
		"dijit/MenuItem",
		"dijit/layout/ContentPane",
		"dijit/form/HorizontalSlider",
		"dojo/dom",
		"dojo/dom-class",
		"dojo/dom-style",
		"dojo/_base/window",
		"dojo/dom-construct",
		"dojo/dom-attr",
		
		"dojo/_base/array",
		"dojo/_base/lang",
		"dojo/on",
		"dojo/parser",
        
		"dojo/text!./explorer.json"
		//plugins/restoration_explorer/
		
       ],
       function (declare, 
					PluginBase, 
					ESRIRequest,
					ArcGISImageServiceLayer,
					ImageServiceParameters,
					RasterFunction,
					Button,
					DropDownButton, 
					DropDownMenu, 
					MenuItem,
					ContentPane,
					HorizontalSlider,
					dom,
					domClass,
					domStyle,
					win,
					domConstruct,
					domAttr,
					array,
					lang,
					on,
					parser,
					explorer
					) {
					
           return declare(PluginBase, {
		       toolbarName: "Restoration Explorer",
               toolbarType: "sidebar",
			   //showServiceLayersInLegend: true,
               allowIdentifyWhenActive: true,
               activate: function () { 
			   
					if (this.currentLayer != undefined)  {
					
						this.currentLayer.setVisibility(true);
					
					}
			   
			   },
               deactivate: function () { },
               hibernate: function () { 
			   
					if (this.currentLayer != undefined)  {
					
						this.currentLayer.setVisibility(false);
					
					}
			   
			   },
			   
			   
				initialize: function (frameworkParameters) {
				
					declare.safeMixin(this, frameworkParameters);

					domClass.add(this.container, "claro");
					
					this.explorerObject = dojo.eval("[" + explorer + "]")[0];
					
					//this.getTemplate("hi")
					
					console.log(this.explorerObject);
					
					this.textnode = domConstruct.create("div", { innerHTML: "<p style='padding:8px'>" + this.explorerObject.text + "</p>" });
					dom.byId(this.container).appendChild(this.textnode);
					
					menu = new DropDownMenu({ style: "display: none;"});
					
					domClass.add(menu.domNode, "claro");
					
					
					array.forEach(this.explorerObject.regions, lang.hitch(this,function(entry, i){
					
/* 						layersRequest = esri.request({
						  url: entry.url,
						  content: { f: "json" },
						  handleAs: "json",
						  callbackParamName: "callback"
						});
						
						layersRequest.then(
						  lang.hitch(entry,function(response) {
							console.log(response);
							this.data = response;
						}), function(error) {
							alert("Error loading Restoration Dashboard Layers, Check to make sure service(s) are on.");
						}); */
						

						menuItem1 = new MenuItem({
							label: entry.name,
							//iconClass:"dijitEditorIcon dijitEditorIconSave",
							onClick: lang.hitch(this,function(e){this.changeGeography(entry)})
						});
						menu.addChild(menuItem1);
						
					}));

					

					this.button = new DropDownButton({
						label: "Choose a Region",
						style: "margin-bottom:6px !important",
						dropDown: menu
					});
					
					dom.byId(this.container).appendChild(this.button.domNode);
						
					this.refreshnode = domConstruct.create("span", {style: "display:none"});
					
					domClass.add(this.refreshnode, "plugin-report-spinner");

					dom.byId(this.container).appendChild(this.refreshnode);
					
				},
				
			   changeGeography: function(geography, zoomto) {
			   
				
			   if (zoomto == undefined) {
			   
					zoomto = true;
			   
			   }
			  		   
			   this.geography = geography;
			   
			    this.sliders = new Array();
			   
				if (this.sliderpane != undefined) { 
				
				  this.sliderpane.destroy();
				  this.map.removeLayer(this.currentLayer)
			
				}

				if (this.buttonpane != undefined) { 
				
				  this.buttonpane.destroy();
			
				}				
					this.sliderpane = new ContentPane({
					  style:"height:287px;border-top-style:groove !important"
					});
					
					dom.byId(this.container).appendChild(this.sliderpane.domNode);
					
					this.buttonpane = new ContentPane({
					  style:"border-top-style:groove !important; height:38px;overflow: hidden !important;background-color:#F3F3F3 !important;padding:2px !important;"
					});
					
					dom.byId(this.container).appendChild(this.buttonpane.domNode);
					
					exportButton = new Button({
						label: "Export",
						style:  "float:right !important;",
						onClick: function(){
						
							
							exportUrl = geography.url + "/exportImage";
							layersRequest = ESRIRequest({
							  url: exportUrl,
							  content: { f: "json" ,pixelType : "F32", format: "tiff", bbox: "-9852928.2643,3522013.8941000025,-9761488.2643,3630213.8941000025", noDataInterpretation: "esriNoDataMatchAny", interpolation: "RSP_BilinearInterpolation"},
							  handleAs: "json",
							  callbackParamName: "callback"
							});
							
							layersRequest.then(
							  function(response) {
								console.log("Success: ", response);
								window.open(response.href)
							}, function(error) {
								console.log("Error: ", error.message);
							});
							
							}
							//window.open(geography.url + "/exportImage")}
						});
						
					this.buttonpane.domNode.appendChild(exportButton.domNode);

					if (geography.methods != undefined) {
						methodsButton = new Button({
							label: "Methods",
							style:  "float:right !important;",
							onClick: function(){window.open(geography.methods)}
							});
							
						this.buttonpane.domNode.appendChild(methodsButton.domNode);
					}
			   
					domStyle.set(this.textnode, "display", "none");
					
					if (this.explorerObject.globalText != undefined) {
					
					explainText = domConstruct.create("div", {style:"margin-top:0px;margin-bottom:10px", innerHTML: this.explorerObject.globalText});
					this.sliderpane.domNode.appendChild(explainText);
					
					}
					
					this.button.set("label",geography.name);
			   
					array.forEach(geography.items, lang.hitch(this,function(entry, i){
					
						if (entry.type == "header") {

							nslidernodeheader = domConstruct.create("div", {style:"margin-top:0px;margin-bottom:10px", innerHTML: "<b>" + entry.text + ":</b>"});
							this.sliderpane.domNode.appendChild(nslidernodeheader);	
							
						} 
						
						if (entry.type == "text") {

							nslidernodeheader = domConstruct.create("div", {style:"margin-top:0px;margin-bottom:10px", innerHTML: entry.text});
							this.sliderpane.domNode.appendChild(nslidernodeheader);	
							
						} 
						
						if (entry.type == "layer") {
						
							nslidernodetitle = domConstruct.create("div", {innerHTML: entry.text});
							this.sliderpane.domNode.appendChild(nslidernodetitle);
							
							
 							nslidernode = domConstruct.create("div");
							this.sliderpane.domNode.appendChild(nslidernode); 
							
					
							steps = ((entry.max - entry.min) / entry.step) + 1;
							
							outslid = "";
							
							middle = Math.round((steps / 2) - 0.5)
							
							for (i=0; i<steps; i++)  {
							
							  if ((steps - 1)  == i) {
								outslid = outslid + "<li>High</li>"
							  } else if (i == 1) {
							  
								outslid = outslid + "<li>Low</li>"
							  } else if (i == middle) {
							  
								outslid = outslid + "<li>Medium</li>"
							  } else {
							  
								outslid = outslid + "<li></li>"
								
								}
							
							}
							
							//alert(outslid);
							
							
							labelsnode = domConstruct.create("ol", {"data-dojo-type":"dijit/form/HorizontalRuleLabels", container:"bottomDecoration", style:"height:1.5em;font-size:75%;color:gray;", innerHTML: outslid})
							nslidernode.appendChild(labelsnode);
					
							
							slider = new HorizontalSlider({
								name: "slider",
								value: entry.default,
								minimum: entry.min,
								maximum: entry.max,
								showButtons:false,
								title: entry.text,
								//intermediateChanges: true,
								discreteValues: steps,
								index: entry.index,
								onChange: lang.hitch(this,this.updateService),
								style: "width:240px;margin-top:10px;margin-bottom:20px"
							}, nslidernode);
							
							parser.parse()
							
							this.sliders.push(slider);
							
						} 
					}));
					
					params = new ImageServiceParameters();
					//params.noData = 0;
				
					this.currentLayer = ArcGISImageServiceLayer(geography.url, {
					  imageServiceParameters: params,
					  opacity: 1
					});
					
					//this.sliderpane.set("tooltip", "Yo")
					
					dojo.connect(this.currentLayer, "onLoad", lang.hitch(this,function(e){
					
										if (zoomto == true) {
											this.map.setExtent(this.currentLayer.fullExtent, true);
										  }
											//alert(this.currentLayer.bands);
											
											//array.forEach(this.currentLayer.bands, function(thing) {alert(thing.max)});
											
											//bc = this.currentLayer.bandCount
											//for (var i=1; i<=bc; i++) {
											//		alert(i);
											//	}									
											
											this.updateService();
											
											}));
					
					dojo.connect(this.currentLayer, "onUpdateStart", lang.hitch(this,function () {
							console.log("Update started...");
							domAttr.set(this.refreshnode, "style", "display:");
						} ));

					dojo.connect(this.currentLayer, "onUpdateEnd", lang.hitch(this,function () {
							console.log("Update Ended...");
							domAttr.set(this.refreshnode, "style", "display:none");
						} ));
						
					this.map.addLayer(this.currentLayer);
					
			   
			   },
			   
			   updateService: function() {
			   
					this.BandFormula = new Array();
					
					array.forEach(this.sliders, lang.hitch(this,function(entry, i){
				
						this.BandFormula.push("(" + entry.value + " * B" + entry.index + ")");
						
						array.forEach(this.geography.items, lang.hitch(this,function(item, j){
						
								if (item.index == entry.index) {
								
									item.default = entry.value;
									
								}
						
						}));
					
					}));
					
					//alert(this.BandFormula.join(" + "));
					
					rasterFunction = new RasterFunction();
					rasterFunction.functionName = "BandArithmetic";
					arguments = {};
					arguments.Method= 0;
					arguments.BandIndexes = this.BandFormula.join(" + ");
					rasterFunction.arguments = arguments; 
					rasterFunction.variableName = "Raster";
					this.currentLayer.setRenderingRule(rasterFunction);
					
				   //legenddiv = domConstruct.create("img", {src:"height:400px", innerHTML: "<b>" + "Legend for Restoration"  + ":</b>"}); 
				   //dom.byId(this.legendContainer).appendChild(this.legenddiv);
				   
				   this.legendContainer.innerHTML = '<div style="margin-bottom:7px">Restoration Explorer</div><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100px" height="90px"><rect x="0" y ="60" width="30" height="20" style="fill:rgb(0,0,0);stroke-width:1;stroke:rgb(0,0,0)" /><rect x="0" y ="30" width="30" height="20" style="fill:rgb(125,125,125);stroke-width:1;stroke:rgb(0,0,0)" /><rect width="30" height="20" style="fill:rgb(255,255,255);stroke-width:1;stroke:rgb(0,0,0)" /><text x="35" y="15" fill="black">High</text><text x="35" y="45" fill="black">Medium</text><text x="35" y="75" fill="black">Low</text></svg>'
				   
				   //noleg = dom.byId("legend-0_msg")
				   //domStyle.set(noleg, "display", "none");
				   
			   },
			   
			   getTemplate: function(name) {
			   
					alert(templates);
			   
			   },
			   
			   identify: function(point, screenPoint, processResults) {
									
					console.log(point)	
					console.log(screenPoint)	
					processResults("Hello")
						
			   },
				
               getState: function () { 
			   
				state = this.geography;
			   
				return state
			   
				},
				
				
               setState: function (state) { 
			   
				//console.log("State")
				//console.log(state)
				
				this.changeGeography(state,false);
				
				},
           });
       });