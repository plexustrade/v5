document.addEventListener( "DOMContentLoaded", function( event ) {

	var playBubble = make_sound("sounds/bubble.mp3");
	var isAdmin = document.location.search == '?admin';
	var bodyFullScreanTogle = make_FullScrinTogle(document.querySelector('body'));
	document.getElementById('fullscreenButton').addEventListener('click', e => bodyFullScreanTogle() );

	function popupActive(popupClass){
		document.querySelector('.paranja').classList.add('active');
		document.querySelector('.popup.' + popupClass).classList.add('active');
	}
	document.querySelector('.paranja').addEventListener('click', function(event){
		this.classList.remove('active');
		let popup = document.querySelectorAll('.popup');
		for (var i = 0; i < popup.length; i++) {
			popup[i].classList.remove('active');
		}
	});

	//fps
	var fps = document.getElementById("fps");
	var startTime = Date.now();
	var frame = 0;


	

	//graphics var
	var width = window.innerWidth;
	var height = window.innerHeight;
	var verticalScreen = height/width > width/height ? true : false;
	var svgViewPort = [-width / 2, -height / 2, width, height];
	var activeDepth = 1;
	// var nodeRadius = width/48;
	var nodeRadius = 20;
	// var activeRadius = nodeRadius*2;
	var activeRadius = 20;
	var animationTime = 250;//ms


	window.simulationResize = function (){};

	//data init
	window.nodes = [];
	var links = [];
	// var jsonData = null;
	var activePath = [];

	//svg init
	// const svg = d3.select("#my_data").append("svg")
	const svg = d3.select("#my_data").append("div")
	.attr('xmlns:xlink', "http://www.w3.org/1999/xlink")
	.attr('style', "width: 100vw;height: 100vh;position: relative;")
	.attr("viewBox", svgViewPort);

	var svgLinks = false;
	var svgNodes = false;
	var svgNodeLables = false;

	var scrollNext = true;
	const slideForse = function (d){
		if(!d.functional){
			if(scrollNext){
				if(d.active){
					return (width/2 + width/2*(d.depth - activeDepth)) - width/2;
				}else{
					return (width/4 + width/2*(d.depth - activeDepth)) - width/2;
				}
			}else{
				return (width/4 + width/2*(d.depth - activeDepth+1)) - width/2;
			}
		}else{
			switch (d.function){
				case 'back':
						// return (width/2 + width/2*(d.depth - activeDepth)) - (width/1.3 + getNodeRadius()*4);
						return (width/10) - width/2;
					break;
				case 'menu':
						// return (width/2 + width/2*(d.depth - activeDepth)) -  (getNodeRadius()*4 + 150);
						return (width - width/4) - width/2;
					break;
				default:
					throw new Error('Неизвестная нода.')
			}
		}
	}

	var manyBodyForce = -width + (1200/width)*50;
	// var manyBodyForce = -1200;
	if (manyBodyForce > 0) manyBodyForce = -manyBodyForce;


	window.tree = new Tree("json/graphdata.json", simInit);

	// tree.admin.set(true);
	// tree.showAllTree();

	function simInit(){

		// console.dir(tree.nodes);
		// console.dir(tree.nodesToDisplay);
		// console.dir(tree.links);
		nodes = tree.nodesToDisplay;
		links = tree.links;

		//init first data
		// makeDataArray(1);
		// makeNodeActive(nodes[0]);

		window.simulation = d3.forceSimulation(nodes)
		.force("link", d3.forceLink(links).id(d => d.id).strength(0.015).distance(1))
		.force("charge", d3.forceManyBody().strength( manyBodyForce ))
		// .force("center", d3.forceCenter(0,0))
		.force("slideForse", d3.forceX(slideForse).strength(0.035))
		.force("y", d3.forceY(d => d.active ? -(height*2/15) : 0).strength(d => d.functional ? 0.03 : 0.03))
		.force("backButton", d3.forceY(height/2 - getNodeRadius()*2).strength(d => d.functional ? 0.1 : 0))
		.alphaTarget(0.5);

		if(verticalScreen){
			window.simulation
			.force("mobileVertical", d3.forceY(
				function(d){
					if(scrollNext){
						return (height/18 + (height*4/5)*(d.depth - activeDepth)) - height/2;
					}else{
						return (height/18 + (height*4/5)*(d.depth - activeDepth+1)) - height/2;
					}
				}
				).strength(
					// d => d.functional ? 0.00 : 0.1
					function(d){
						if(d.functional){
							return 0;
						}else if(d.activePath == 'child'){
							console.dir(d.activePath);
							console.dir(d.id);
							return  d.id/90;
						}else{
							return 0.1;
						}
					}
				)
			)
		}

		// buildLinks(links);
		buildNodes(nodes);
		// buildNodeTitles(svgNodes);
		// buildNodeLables(nodes);

		simulation.on("tick", simulationTick);
	}
	// d3.json("json/graphdata.json", function readDataFormFileFirstTime(jsonDataFromFile) {
	// 	jsonData = jsonDataFromFile;

		
	// });


	//admin button
	// d3.select("body")
	// .append("button")
	// .attr('class', 'adminButton')
	// .text('Admin')
	// .on("click", function(event){
	// 	isAdmin = !isAdmin;
	// 	this.classList.toggle('active');
	// 	var activeNode = nodes.filter(d => d.active)[0];
	// 	bubleClick(activeNode);
	// });




	function bubleClick(d) {
		playBubble();

		tree.cliсkOnNode(d);

		if(d.functional){
			switch (d.function){
				case 'back':
					tree.backButton();
					break;
				case 'menu':
					popupActive('menu');
					break;
				default:
					throw new Error('Неизвестная нода.')
			}
		}

		if(d.iframe){
			var iframe = document.querySelector('.iframe iframe');
			var iframeSrc = iframe.getAttribute("src");
			if(iframeSrc !=  d.iframe){
				iframe.setAttribute("src", d.iframe);
			}
			popupActive('iframe');
		}
		// console.dir(tree.nodes);
		// console.dir(tree.nodesToDisplay);
		// console.dir(tree.links);

		nodes = tree.nodesToDisplay;
		links = tree.links;

		var isAddNewNode;

		//apply click function

		//draw
		activeDepth = d.depth;
		
		// buildLinks(links);
		buildNodes(nodes);
		// buildNodeTitles(svgNodes);
		// buildNodeLables(nodes);

		simulation.nodes(nodes);
		simulation.force("link").links(links);
		simulation.alphaTarget(0.8).restart();
		// simulation.alpha(0.2).restart();

		return;
	}

	function simulationTick(){
		//fps
		var time = Date.now();
		frame++;
		if (time - startTime > 1000) {
			fps.innerHTML = (frame / ((time - startTime) / 1000)).toFixed(1);
			startTime = time;
			frame = 0;
		}


		// svgLinks
		// .attr("x1", d => d.source.x)
		// .attr("y1", d => d.source.y)
		// .attr("x2", d => d.target.x)
		// .attr("y2", d => d.target.y);

		svgNodes
		// .attr("cx", 
		// 	// d => d.x
		// 	function(d){
		// 		// console.log(d)
		// 		return d.x;
		// 	}
		// 	)
		// .attr("cy", d => d.y);
		.attr("style", function (d){ 
			return 'left:'+d.x+'px;top:'+d.y+'px;'
		});

		// svgNodeLables
		// // .attr("x", d => {
		// // 	// console.log(d);
		// // 	svgNodeLables.selectAll('.c'+d.id+' tspan')
		// // 	.attr("x", d.x-getNodeRadius()+10)
		// // 	.attr("y", d.y+getNodeRadius()-10)
		// // 	return d.x;
		// // })
		// // .attr("y", d => d.y);
		// .attr("style", function (d){ 
		// 	return 'left:'+d.x+'px;top:'+d.y+'px;'
		// });

		// svgNodeLables
		// .selectAll("tspan")
		// .attr("x", d => {
		// 	// return d.x;
		// })
	}

	function buildNodes(nodes){
		if(!svgNodes){
			// svgNodes = svg.append("g")
			svgNodes = svg.append("div")
			.attr("class", "nodes")
			.attr("style", "position: absolute;left: 50vw;top: 50vh;")
			.selectAll("div")
			
			.data(nodes);

			// svgNodes = svgNodes.enter().append("circle")
			svgNodes = svgNodes.enter().append("div")
			.classed('active', d => d.active)
			.classed('fade', d => d.activePath == 'fade')
			.attr("node-id", d => d.id)
			// .call(
			// 	d3.drag(simulation)
			// 	.on("start", dragstarted)
			// 	.on("drag", dragged)
			// 	.on("end", dragended)
			// 	)
			.on("click", bubleClick);

			svgNodes.append("div")
			.classed('text', true)
			.html(d => d.label);

			svgNodes.append("div")
			.classed('c1', true);

			svgNodes.append("div")
			.classed('c2', true);

			setNodeStyle();

		}else{
			var tempNode = svgNodes 
			.data(nodes, d => d.id);

			tempNode
			.classed('active', d => d.active)
			.classed('fade', d => d.activePath == 'fade');

			var tt = tempNode.enter().append("div")
			// .attr("r", nodeRadius)
			// .attr("stroke-width", nodeRadius*(5/3))
			.attr("node-id", // d => d.id 
				function(d){
					//add nodes
					svgNodes._groups[0].push(this);
					return d.id
				}
				)
			// .call(
			// 	d3.drag(simulation)
			// 	.on("start", dragstarted)
			// 	.on("drag", dragged)
			// 	.on("end", dragended)
			// 	)
			.on("click", bubleClick);


			tt.append("div")
			.classed('text', true)
			.html(d => d.label);


			tt.append("div")
			.classed('c1', true);

			tt.append("div")
			.classed('c2', true);


			tempNode.exit()
			.attr('node-id',function(d, i){
					//remove nodes
					delete svgNodes._groups[0][i];
					return 1;
				})
			.remove();

			setNodeStyle();
		}
	}

	function buildLinks(links){
		if(!svgLinks){
			svgLinks = svg.append("g")
			.attr("class", "links")
			.selectAll("line")
			.data(links)
			.enter().append("line")
			.attr("stroke-width", d => d.value)
			.attr("stroke-dasharray", setDashedLineStyle);
		}else{
			var tempLink = svgLinks
			.data(links, 
				function(d){
					if(typeof d.source === 'object' ){
						return [d.source.id, d.target.id];
					}else{
						return [d.source, d.target];
					}
				}
				);

			tempLink.enter().append("line")
			.attr("stroke-width", 
				// d => d.value
				function(d){
					//add links
					svgLinks._groups[0].push(this);
					
					return d.value ;
				}
				)
			.attr("stroke-dasharray", setDashedLineStyle);

			tempLink.exit()
			.attr('node-id',function(d, i){
					//remove links
					delete svgLinks._groups[0][i];
					return 1;
				})
			.remove();
		}
	}

	function buildNodeTitles(svgNodes){
		svgNodes
		.selectAll('title')
		.remove();
		svgNodes
		.append("title")
		.text(d => d.id);
	}

	function buildNodeLables(nodes){
		if(!svgNodeLables){
			svgNodeLables = svg.append("div")
			.attr("class", "nodesLabel")
			.selectAll("div")
			.data(nodes)
			.enter().append("div")
			.attr('class', d => 'c'+d.id+' text')
			.classed('active', d => d.active)
			// .attr('translate', translateText)
			// .html(formatNodeLablesText)
			.html(d => d.label)

			//отдельно
			// console.dir(svgNodeLables);
			// svgNodeLables
			// .append("tspan")
			// .text(formatNodeLablesText);
			//отдельно

			// svgNodeLables = svg.append("g")
			// .attr("class", "nodesLabel")
			// .selectAll("foreignObject")
			// .data(nodes)
			// .enter().append("foreignObject")
			// .attr('width', width*0.5)
			// .attr('height', height*0.5)
			// .classed('active', d => d.active);
			// svgNodeLables
			// // .append("body")
			// .append("xhtml:div")
			// .attr('xmlns', "http://www.w3.org/1999/xhtml")
			// .html(function(d, i) { return d.label });

		}else{
			var tempNodeLables = svgNodeLables
			.data(nodes, d => d.id);

			tempNodeLables
			.attr('class', d => 'c'+d.id+' text')
			.classed('active', d => d.active)
			// .attr('translate', translateText);

			tempNodeLables.enter().append("div")
			.attr('class', d => 'c'+d.id+' text')
			.html(function(d, i) {
				//add lables
				svgNodeLables._groups[0].push(this);
				return d.label

			})
			// .html(function(d, i) {
			// 	//add lables
			// 	svgNodeLables._groups[0].push(this);
			// 	//временно подставил сюда функцию formatNodeLablesText
			// 	var textArr = d.label.split("\n"); 
			// 	var result = '';
			// 	if(textArr.length > 1){
			// 		textArr.forEach((element, i) => {
			// 			if(i == 0){
			// 				result += '<tspan>';
			// 			}else{
			// 				result += '<tspan dy="'+i+'em">';
			// 			}
			// 			result += element;
			// 			result += '</tspan>';
			// 		}
			// 		);
			// 	}else{
			// 		result += '<tspan>';
			// 		result += d.label;
			// 		result += '</tspan>';
			// 	}
			// 	return result; 
			// });

			tempNodeLables.exit()
			.attr('node-id',function(d, i){
					//remove lables
					delete svgNodeLables._groups[0][i];
					return 1;
				})
			.remove();
		}
	}

	function formatNodeLablesText(d, i) { 
		var textArr = d.label.split("\n"); 
		var result = '';
		if(textArr.length > 1){
			textArr.forEach((element, i) => {
				if(i == 0){
					result += '<tspan>';
				}else{
					result += '<tspan dy="'+i+'em">';
				}
				result += element;
				result += '</tspan>';
			}
			);
		}else{
			result += '<tspan>';
			result += d.label;
			result += '</tspan>';
		}
		return result;
	}

	function translateText(d){
		if(d.active){
			var bbox = this.getBBox();
			//if text size no init yet
			if(bbox.width == 0) {
				setTimeout(function(self){
					var bbox = self.getBBox();

					self.style.setProperty('transform', 'translateX(-'+bbox.width+'px)');
				}, 100, this);
			}else{
				setTimeout(function(self){
					var bbox = self.getBBox();
					
					//посмотреть можно ли сделать анимацию через d3, force

					self.style.setProperty('transform', 'translateX(-'+bbox.width+'px)');
				}, 300, this);
			}
			// this.style.setProperty('transform', 'translateX(-'+bbox.width*2+'px)');
			return 'active'
		}else{
			this.style.removeProperty('transform');
			return 'unset'
		}
	}

	function setDashedLineStyle(node){
		return node.dashed ? '8 11' : 'unset'
	}

	function setNodeStyle(){
		nodeRadius = getNodeRadius();
		activeRadius = getActiveNodeRadius();
		svgNodes
		.transition()
		.duration(animationTime)
		.attr("r", d => d.active ? activeRadius : nodeRadius)
		// .attr("stroke-width", d => d.active ? activeRadius*(5/3) : nodeRadius*(5/3));
	}

	function getNodeRadius(){
		// return width/48;
		return 5;
	}
	function getActiveNodeRadius(){
		// return getNodeRadius()*2;
		return getNodeRadius();
	}

	function makeDataArray(depth, d = jsonData.nodes[0]){

		if(depth <= 0) return;
		//add node to active path
		var nodesToDelFormActive = [];
		for (var i = 0; i < activePath.length; i++) {
			if(activePath[i].depth >= depth){
				for (var j = 0; j < jsonData.nodes.length; j++) {
					if(jsonData.nodes[j].id == activePath[i].id){
						jsonData.nodes[j].activePath = false;
						nodesToDelFormActive.push(activePath[i].id);
					}
				}
			}
		}
		for (var i = 0; i < nodesToDelFormActive.length; i++) {
			for (var j = 0; j < activePath.length; j++) {
				if(activePath[j].id == nodesToDelFormActive[i]){
					activePath.splice(j, 1);
				}
			}
			
		}
		
		for (var i = 0; i < jsonData.nodes.length; i++) {
			if(jsonData.nodes[i].id == d.id){
				jsonData.nodes[i].activePath = true;
				activePath.push({
					"id" :jsonData.nodes[i].id,
					"depth": depth
					});
			}
			
		}


		let nodes = jsonData.nodes;
		var newNodes = [];
		var newLinks = [];
		var maxNodeId = nodes[nodes.length-1].id;



		scrollNext = isHasChild(d);
		var hasChild = isHasChild(d,false);

		if(hasChild){
			setDepth(depth+1);
			buildData(depth+1);
		}else{
			setDepth(depth);
			buildData(depth);
		}

		// add to full screen button
		newNodes.push({
			"id": "fullscreen",
			// "label": "🖵",
			"label": "Full\nscreen",
			"parents": [0],
			"depth": depth,
			"fullscreen": true,
			"functional": true
		});

		//click by "+" node to make it active need to add it to
		//newNodes manually
		if(isAdmin && (d.id >= maxNodeId || d.addNew) ){
			newNodes.push(d);
			newLinks.push(links.find(t => t.target.id == d.id));
		}
		

		if(!isAdmin){
			newNodes = newNodes.filter(d => !d.addNew);
		}

		//check if all links has they nodes
		checkLinks: for (var i = 0; i < newLinks.length; i++) {
			for (var k = 0; k < newNodes.length; k++) {
				if(typeof newLinks[i].source === 'object' ){
					if(newLinks[i].source.id == newNodes[k].id){
						continue checkLinks;
					}
				}else{
					if(newLinks[i].source == newNodes[k].id){
						continue checkLinks;
					}
				}
			}
			newLinks.splice(i, 1);
		}

		//delete not chosen way

		//сравнение нод
		// forNewNodes: for (var i = 0; i < newNodes.length; i++) {
		// 	for (var k = window.nodes.length - 1; k >= 0; k--) {
		// 		if(window.nodes[k].id == newNodes[i].id){
		// 			window.nodes[k].depth = newNodes[i].depth;
		// 			continue forNewNodes;
		// 		}
		// 	}
		// 	window.nodes.push(newNodes[i]);
		// }
		window.nodes = newNodes.map( d => Object.assign( window.nodes.find(t => t.id == d.id) || {}, d) );
		links = newLinks.map( d => Object.assign({}, d));


		// console.log(nodes);
		// console.log(newNodes);
		// console.log(window.nodes);
		// console.log(newLinks);
		// exit();

		function isHasChild(d, testForAdminChild = true){
			if(isAdmin && !d.addNew && testForAdminChild) return true;
			for (var i = 0; i < nodes.length; i++) {
				for (var k = 0; k < nodes[i].parents.length; k++) {
					if(nodes[i].parents[k] == d.id){
						return true;
					}
				}
			}
			return false;
		}

		function setDepth(depth){
			let curentDepth = 1;
			let parentIds = [];
			let oldparentIds = [];
			for (;curentDepth <= depth; curentDepth++ ){
				oldparentIds = parentIds;
				parentIds = [];
				for (var i = 0; i < nodes.length; i++){
					let hasId = false;
					for (var j = 0; j < oldparentIds.length; j++) {
						for (var k = 0; k < nodes[i].parents.length; k++) {
							if( nodes[i].parents[k] == oldparentIds[j] ){
								hasId = true;
							}
						}
					}
					if(nodes[i].parents[0] == 0 && curentDepth == 1){
						nodes[i].depth = 1;
						parentIds.push(nodes[i].id);
					}else if( hasId ){
						nodes[i].depth = curentDepth;
						parentIds.push(nodes[i].id);
					}
				}
			}
		}

		function buildData(depth){
			buildDataNodes: for (var i = 0; i < nodes.length; i++) {
				if( nodes[i].depth && nodes[i].depth <= depth){
					
					//Do node on active path?
					var activePathChild = false;
					for (var j = 0; j < activePath.length; j++) {
						for (var k = 0; k < nodes[i].parents.length; k++) {
							if( nodes[i].parents[k] == activePath[j].id ){
								activePathChild = true;
							}
						}
					}
					if(nodes[i].activePath === true){
						nodes[i].activePath = true;
					}else if(activePathChild && nodes[i].depth <= (depth-1)){
						nodes[i].activePath = 'fade';
					}else if(activePathChild && nodes[i].depth > (depth-1)){
						nodes[i].activePath = 'child';
					}else{
						nodes[i].activePath = false;
						continue buildDataNodes;
					}
					// if(nodes[i].depth >= depth){
					// 	var parentFlag = true;
					// 	for (var k = 0; k < nodes[i].parents.length; k++) {
					// 		if(nodes[i].parents[k] == d.id) parentFlag = false;
					// 	}
					// 	if(parentFlag) continue buildDataNodes;
					// }

					nodes[i].id = 1*nodes[i].id;
					newNodes.push(nodes[i]);
					if(isAdmin && d.id == nodes[i].id){
						maxNodeId = 1*maxNodeId + 1;
						newNodes.push(
						{
							"depth": nodes[i].depth+1,
							"id": maxNodeId,
							"label": "+",
							"parents": [nodes[i].id],
							"addNew": true
						}
						);
						newLinks.push({
							source: parseInt(nodes[i].id),
							target: maxNodeId,
							dashed: true,
							value: 2
						});
					}

					nodes[i].parents.forEach(function(parent) {
						//core node hasn't links
						if(parent == 0) return;

						newLinks.push({
							source: 1*parent,
							target: parseInt(nodes[i].id),
							value: 2
						});
					});

				}
			}
		}
	}

	function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}

	function dragended(d) {
		if (!d3.event.active) simulation.alphaTarget(0);
		d.fx = null;
		d.fy = null;
	}

	// function makeNodeActive(currNode){
	// 	nodes.forEach( item => item.active = false );
	// 	currNode.active = true;
	// }

	window.simulationResize = function (){
		// width = window.innerWidth;
		// height = window.innerHeight;

		setNodeStyle();

		// simulation.force("link").links(links);
		simulation
		// .force("link", d3.forceLink(links).id(d => d.id).strength(0.015).distance(1))
		.force("charge", d3.forceManyBody().strength( manyBodyForce ))
		.force("slideForse", d3.forceX(slideForse).strength(0.1))
		// .force("y", d3.forceY().strength(0.015))
		.alphaTarget(0.2)
		.restart();
	}
	window.simulationResize = throttle(simulationResize, 50);


	//resize
	window.addEventListener('resize', function(event){

		width = window.innerWidth;
		height = window.innerHeight;
		verticalScreen = height/width > width/height ? true : false;
		svgViewPort = [-width / 2, -height / 2, width, height];
		d3.select("#my_data svg")
		.attr("viewBox", svgViewPort);

		simulationResize();
	});

	document.addEventListener('keypress', keyFunc, false);

	function keyFunc(event){
		console.dir(event);
		switch (event.code){
			case 'KeyF':
			bodyFullScreanTogle();;
			break;
			default:
			break;
		}
	}

	function make_sound(name){
		var myAudio = new Audio;
		myAudio.src = name; 
		myAudio.volume = 0.1;
		return function(){
			myAudio.play(); 
		}
	}

	// затормозить функцию до одного раза в time мс
	function throttle(func, time) {
		var permision = true;
		var saveArg = null;
		var saveThis = null;
		return function waper(){
			if (permision){
				func.apply(this, arguments);
				permision = false;
				setTimeout(function(){
					permision = true;
					if(saveThis){
						waper.apply(saveThis, saveArg);
						saveArg = saveThis = null;
					}
				}, time);
			}else{
				saveArg = arguments;
				saveThis = this;
			}
		}
	}

	function make_FullScrinTogle(elem){
		var is_fullScrin = false;
		function openFullscreen(elem) {
			if (elem.requestFullscreen) {
				elem.requestFullscreen();
			} else if (elem.mozRequestFullScreen) { /* Firefox */
				elem.mozRequestFullScreen();
			} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
				elem.webkitRequestFullscreen();
			} else if (elem.msRequestFullscreen) { /* IE/Edge */
				elem.msRequestFullscreen();
			}
		}
		function closeFullscreen() {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.mozCancelFullScreen) { /* Firefox */
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
				document.webkitExitFullscreen();
			} else if (document.msExitFullscreen) { /* IE/Edge */
				document.msExitFullscreen();
			}
		}

		return function(){
			if(!is_fullScrin){
				openFullscreen(elem);
				is_fullScrin = true;
			}else{
				closeFullscreen(elem);
				is_fullScrin = false;
			}
		}
	}
	
	//prepare data to simulation
	function Tree(jsonPath, callback){
		var myThis = this;
		this.activeNode = null;
		this.getChildrenNodes = function(node){};
		this.getClosestParent = function(node){};
		this.makeNodeActive = makeNodeActive;
		this.cliсkOnNode = cliсkOnNode;
		this.jsonPath = jsonPath;
		this.admin = Admin(document.location.search == '?admin');
		//для использования нужно сделать очистку activePath с учётом возможности прижка между нодами
		this.showAllTree = showAllTree;
		this.backButton = backButton;
		/*
		* node = {
		*	id: int,
		*	active: bool,
		*	activePath: bool,
		*	depth: int,
		*	label: str,
		*	parents: arr,
		*	children: arr,
		*	functional: bool,
		*	function: str,
		*	addNew: bool,
		*	display: bool,
		* }
		*/
		this.nodes = [];
		this.nodesToDisplay = [];
		/*
		* link = {
		*	source: int || obj of node,
		*	target: int || obj of node,
		*	dashed: bool,
		*	value: int=2,
		* }
		*/
		this.links = [];

		var isShowAllTree = false;



		var jsonData = null;
		var simulationInit = false;
		var initCallback = callback;

		init(this.jsonPath);

		function init(jsonPath){
			//read data
			d3.json(jsonPath, readJsonData);
		}

		function readJsonData(jsonDataFromFile){

			jsonData = jsonDataFromFile;

			if(!simulationInit){
				simulationInit = true;
				makeNodeTree(jsonData);
				initCallback.apply(myThis, []);
			}
		}

		function makeNodeTree(jsonData){
			var nodes = [];
			myThis.nodes = nodes = jsonData.nodes;
			for (var i = 0; i < nodes.length; i++) {
				nodes[i].id = nodes[i].id*1;
				nodes[i].active = false;
				nodes[i].activePath = false;
				nodes[i].depth = undefined;
				nodes[i].children = [];
				nodes[i].functional = false;
				nodes[i].function = '';
				nodes[i].addNew = false;
				nodes[i].display = false;
			}
			updateNodes();
		}

		function setNodesDepth(depth, widthChildrens = true){
			let curentDepth = 1;
			let parentIds = [];
			let oldparentIds = [];
			let currActivePath = getActivePath();
			let nodes = myThis.nodes;

			//возможно стоить брать depth не от текущей нажатой ноды а от глобального значения

			if('first' == depth) depth = 1;
			if(widthChildrens) depth++;
			if(isShowAllTree){
				//calculate all depht if need to show whole tree
				depth = nodes.length;
			}

			for (;curentDepth <= depth; curentDepth++ ){
				oldparentIds = parentIds;
				parentIds = [];
				for (var i = 0; i < nodes.length; i++){
					let hasId = false;
					for (var j = 0; j < oldparentIds.length; j++) {
						if(!isInArrayId(oldparentIds[j], currActivePath)) continue;
						for (var k = 0; k < nodes[i].parents.length; k++) {
							if( nodes[i].parents[k] == oldparentIds[j]){
								hasId = true;
							}
						}
					}
					if(nodes[i].parents[0] == 0 && curentDepth == 1){
						nodes[i].depth = 1;
						parentIds.push(nodes[i].id);
					}else if( hasId ){
						nodes[i].depth = curentDepth;
						parentIds.push(nodes[i].id);
					}else if( nodes[i].functional ){
						nodes[i].depth = myThis.activeNode.depth;
					}
				}
			}
		}

		function setNodesChildrens(node){
			let nodes = myThis.nodes;
			var id = undefined;
			var nodeChildrens = [];

			for (var j = 0; j < nodes.length; j++) {
				id = nodes[j].id;
				nodeChildrens = [];

				if(nodes[j].functional) continue;

				for (var i = 0; i < nodes.length; i++) {
					for (var k = 0; k < nodes[i].parents.length; k++) {
						if( nodes[i].parents[k] == id ){
							nodeChildrens.push(nodes[i].id*1);
						}
					}
				}
				myThis.nodes[j].children = nodeChildrens;
			}
		}

		function makeNodeActive(currNode){
			if('first' == currNode) currNode = myThis.nodes[0];
			if(currNode.functional) return;
			myThis.nodes.forEach( function(item){
				item.active = false;
				if(item.depth && item.depth == currNode.depth){
					item.activePath = false;
				}
			});
			currNode = getNodeById(currNode.id)
			currNode.active = true;
			currNode.activePath = true;
			myThis.activeNode = currNode;
		}

		function setNodesDisplay(depth, widthChildrens = true){
			let nodes = myThis.nodes;
			let activeNode = myThis.activeNode;

			if('first' == depth) depth = 1;
			if(widthChildrens) depth++;

			for (var i = 0; i < nodes.length; i++) {
				if(showNode(nodes[i], depth)){
					nodes[i].display = true;
				}else if(nodes[i].functional){
					switch (nodes[i].function){
						case 'back':
							if(myThis.activeNode.depth > 1){
								nodes[i].display = true;
							}else{
								nodes[i].display = false;
							}
							break;
						default:
							nodes[i].display = true;
							break;
							// throw new Error('Неизвестная функциональная нода.')
					}
				}else{
					nodes[i].display = false;
				}
			}

			if(widthChildrens){
				for (var i = 0; i < activeNode.children.length; i++) {
					for (var j = 0; j < nodes.length; j++) {
						if(nodes[j].id == activeNode.children[i]){
							nodes[j].display = true;
						}
					}
				}
			}
		}

		function showNode(node, depth){
			if(node.depth <= depth && node.activePath == true || isShowAllTree){
				return true;
			}else{
				return false;
			}
		}

		function updateNodesToDisplay(){
			let nodes = myThis.nodes.map((node) => node);
			let nodesToDisplay = myThis.nodesToDisplay.map((node) => node);
			let nodeToHide = true;
			let nodeToAdd = true;

			//update-delete exiting nodes
			for (var i = 0; i < nodesToDisplay.length; i++) {
				nodeToHide = true;
				for (var j = 0; j < nodes.length; j++) {
					if(nodes[j].id == nodesToDisplay[i].id && nodes[j].display){
						Object.assign(nodesToDisplay[i], nodes[j]);
						nodeToHide = false;
					}
				}
				if(nodeToHide){
					for (var k = 0; k < myThis.nodesToDisplay.length; k++) {
						if(myThis.nodesToDisplay[k].id == nodesToDisplay[i].id)
						myThis.nodesToDisplay.splice(k, 1);
					}
				}
			}

			nodesToDisplay = myThis.nodesToDisplay;

			//add new
			for (var i = 0; i < nodes.length; i++) {
				if(nodes[i].display){
					nodeToAdd = true
					for (var j = 0; j < nodesToDisplay.length; j++){
						if(nodesToDisplay[j].id == nodes[i].id){
							nodeToAdd = false;
						}
					}
					if(nodeToAdd){
						myThis.nodesToDisplay.push(nodes[i]);
					}
				}
			}
		}

		function updateLinks(){
			let nodes = myThis.nodesToDisplay;
			myThis.links = [];

			for (var i = 0; i < nodes.length; i++) {

				if(nodes[i].functional) continue;

				nodes[i].parents.forEach(function(parent) {
					//core node hasn't links
					if(parent == 0) return;
					//node don't show
					if(!isInArrayId(parent, nodes)) return;

					myThis.links.push({
						source: getNodeById(parent*1),
						target: nodes[i],
						dashed: nodes[i].addNew,
						value: 2
					});
				});

			}
		}

		function isInArrayId(id, array = []){
			for (var i = 0; i < array.length; i++) {
				if(array[i].id == id){
					return true;
				}
			}
			return false
		}

		function getNodeById(id){
			let nodes = myThis.nodes;
			for (var i = 0; i < nodes.length; i++) {
				if(nodes[i].id == id){
					return myThis.nodes[i];
				}
			}
			return false;
		}

		function cliсkOnNode(node){
			updateNodes(node);
		}

		
		function updateNodes(node = 'first'){
			makeNodeActive(node);// перенести в cliсkOnNode
			addFunctionalButtons();
			myThis.admin.updateNodes();
			setNodesChildrens();
			setNodesDepth(node.depth || 'first'); // убрать глубину и сделать зависимой от активной ноды
			setNodesDisplay(node.depth || 'first'); // убрать глубину и сделать зависимой от активной ноды
			updateNodesToDisplay();
			updateLinks();
		}

		function Admin(admin = false){
			var isAdmin = admin;
			var maxNodeId = 0;

			function getMaxId(nodes){
				let nodeIds = nodes.map((node) => node.id);
				return Math.max.apply(null, nodeIds);
			}

			function delAllNewNodes(){
				let nodes = myThis.nodes.map((node) => node);
				for (var i = 0; i < nodes.length; i++) {
					if(nodes[i].addNew){
						myThis.nodes.splice(i, 1);
					}
				}
			}

			function delAllNewNodesExceptActive(){
				let nodes = myThis.nodes.map((node) => node);
				for (var i = 0; i < nodes.length; i++) {
					if(nodes[i].addNew && !nodes[i].active){
						myThis.nodes.splice(i, 1);
					}
				}
			}

			function isHasNewNode(node){
				let childrens = node.children;
				let currNode = null;
				for (var i = 0; i < childrens.length; i++) {
					currNode = getNodeById(childrens[i]);
					if(currNode.addNew){
						return true;
					}
				}
				return false;
			}

			return {
				set: function(admin){
					isAdmin = !!admin;
				},
				get: function(admin){
					return isAdmin;
				},
				updateNodes: function(){
					let nodes = myThis.nodes.map((node) => node);

					if(isAdmin){
						delAllNewNodesExceptActive();
						for (var i = 0; i < nodes.length; i++) {
							//режым бесконечных плюсиков !nodes[i].addNew
							if(
								myThis.activeNode.id == nodes[i].id && 
								!nodes[i].addNew && 
								!isHasNewNode(nodes[i])
							){
								maxNodeId = getMaxId(myThis.nodes)*1 + 1;
								myThis.nodes.push({
									id: maxNodeId,
									active: false,
									activePath: false,
									depth: undefined,//nodes[i].depth+1
									label: "+",
									parents: [nodes[i].id],
									children: [],
									functional: false,
									function: '',
									addNew: true,
									display: false,
								});
							}
						}
					}else{
						delAllNewNodes();
					}
				}
			}
		}


		function showAllTree(show = true){
			isShowAllTree = !!show;
		}

		function addFunctionalButtons(){
			addFunctionalButton(10000, 'назад', 'back');
			addFunctionalButton(10001, 'меню', 'menu');
		}

		function addFunctionalButton(id, name, function1){
			if(!getNodeById(id)){
				myThis.nodes.push({
					id: id,
					active: false,
					activePath: false,
					depth: undefined,
					label: name,
					parents: [],
					children: [],
					functional: true,
					function: function1,
					addNew: false,
					display: false
				});
			}
		}


		function backButton(){
			let activeDepth = myThis.activeNode.depth;
			let currActivePath = getActivePath();

			activeDepth--;

			//clear previos activePath
			//spep back activePath
			//тут надо функцию которя буде удалять activePath во всех нодах в которых depth <= activeDepth
			//или это не тут а при клике на ноду нужно делать
			myThis.activeNode.activePath = false;

			// console.log(currActivePath);
			for (var i = 0; i < currActivePath.length; i++) {
				if(currActivePath[i].depth == activeDepth){
					cliсkOnNode(currActivePath[i]);
				}
			}
		}

		function getActivePath(){
			let nodes = myThis.nodes;
			let activePath = [];
			for (var i = 0; i < nodes.length; i++) {
				if(nodes[i].activePath){
					activePath.push(nodes[i]);
				}
			}
			return activePath.sort( (a, b) => a.depth*1 - b.depth*1 );
		}



	}

});