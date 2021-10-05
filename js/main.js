var isMobile = false; //initiate as false
// device detection
// if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
//     || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
//     isMobile = true;
//     alert("isMobile")  
// }
document.addEventListener('DOMContentLoaded', function(){
  if( /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    isMobile = true;
    // alert("isMobile")
   }
});

// console.log(isMobile)

var height = parseInt(d3.select('#my_data').style('height'), 10)
    width = parseInt(d3.select('#my_data').style('width'), 10)

// const forceX = d3.forceX(width / 2).strength(0.01)
// const forceY = d3.forceY(height / 2).strength(0.01)
const radiusScale = d3.scaleSqrt()
      .domain([1, 9])
      .range([.01, 10])
const forceCollide = d3.forceCollide(function(d) {
  return radiusScale + 10
})

var svg = d3.select("#my_data").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).strength(0.025))
    .force("charge", d3.forceManyBody().strength(-600))
    .force("center", d3.forceCenter(width / 2, height / 2))
    // .force('x', forceX)
    // .force('y',  forceY)
    .force('collide', forceCollide)

    
    // document.querySelector("svg").classList.add("img-fluid");
// Add an event listener that run the function when dimension change
// window.addEventListener('resize', svg );



$(window).on("resize", function() {
  let aspect = width / height;
  var targetWidth = svg.node().getBoundingClientRect().width;
  // console.log(svg.node().getBoundingClientRect().width);
  svg.attr("width", targetWidth);
  svg.attr("height", targetWidth / aspect);
});

d3.json("./json/graphdata.json", function(error, graph) {
  if (error) throw error;
    
  var nodes = graph.nodes;
  var links = graph.links;

  var link = svg.append("g") 
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", function(d) { return color(d.weight); })
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });
    
  var node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      // .attr("r", function(d) { return Math.sqrt(d.weight); })
      .attr("r", function(d) { if (!isMobile) {var nodeRadius = d.weight/2700 * width/15;} else {nodeRadius = d.weight/2700 * width/8;} return nodeRadius })
      .attr("fill", function(d) { return color(d.weight); })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended))
      .on("mouseover", function(d) {
        // show circle selected
          d3.select(this)
            .transition()
            .duration(200)
            // .style("fill", "#ee5253")
            .style("stroke-width", "50");
      })
      .on('mouseout', function(d) {
          // hide the circle
          d3.select(this)
              .transition()
              .duration(200)
              // .style("fill", "#fff")
              .style("stroke-width", "20");
      })
      // on click action
      .on("click", click)

      var nodeCirclesArr = document.querySelectorAll("circle");
      
  // Add a text element to the previously added g element.
  var labelNode = svg.append("g").attr("class", "labelNodes")
  .selectAll("text")
  .data(nodes)
  .enter()
  .append("text")
  .text(function(d, i) { return d.label })
  .style("fill", "#555")
  .style("font-family", "Arial")
  .style("font-size", 12)
  .style("pointer-events", "none");

  node.append("title")
      .text(function(d) { return d.title; });
    
  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    nodeCirclesArr.forEach( (el) => {
      node
      .attr("cx", function(d, i) {
        if(!isMobile) {
          if(i == 0){
            var circlePosX = d.x - 200
          } else if(i == 1) {
            circlePosX = d.x + 300
          } else if (i == 2) {
            circlePosX = d.x + 300
          }
        } else {
          if(i == 0){
            var circlePosX = d.x - 200
          } else if(i == 1) {
            circlePosX = d.x + 100
          } else if (i == 2) {
            circlePosX = d.x + 100
          }
        }
        // console.log(width)
        // console.dir('i-'+i);
        // console.dir('circlePosX-'+circlePosX);
        // console.dir('d.x-'+d.x);
        
        return circlePosX
      })
      .attr("cy", function(d, i) {
        if(!isMobile) {
          if(i == 0){
            var circlePosY = d.y - 50
          } else if(i == 1) {
            circlePosY = d.y + 100
          } else if (i == 2) {
            circlePosY = d.y + 100
          }
        } else {
          if(i == 0){
            var circlePosY = d.y - 150
          } else if(i == 1) {
            circlePosY = d.y + 100
          } else if (i == 2) {
            circlePosY = d.y + 100
          }
        }
        
        return circlePosY
      });
    });
    link
      .attr("x1", function(d) { if(!isMobile) { var x1 = d.source.x - 200;} else {x1 = d.source.x - 200;} return x1 })
      .attr("y1", function(d) { if(!isMobile) { var y1 = d.source.y - 50;} else {y1 = d.source.y - 150;} return y1 })
      .attr("x2", function(d) { if(!isMobile) { var x2 = d.target.x + 300;} else {x2 = d.target.x + 100;} return x2 })
      .attr("y2", function(d) { if(!isMobile) { var y2 = d.target.y + 100;} else {y2 = d.target.y + 100;} return y2 });
    // node
    //   .attr("cx", function(d) { return d.x; })
    //   .attr("cy", function(d) { return d.y; });
    labelNode.call(updateNode);
  }
});


// Toggle children on click.
function click(d) {
  if (d.children) {
    // d.children.forEach( el => {
    //   console.log(el.weight)
    // })
    // console.log(d.children.weight)
    var childrenCount = d.children.length
    
      // d._children = d.children;
      // d.children = null;
      d3.select("svg .links")
      .transition()
      .duration(700)
      .style("transform", `translateX(-${width/2.5}px)`);
      d3.select("svg .nodes")
      .transition()
      .duration(700)
      .style("transform", `translateX(-${width/2.5}px)`)
      
      d3.select("svg .labelNodes")
      .transition()
      .duration(700)
      .style("transform", `translateX(-${width/2.5}px)`);
      // .style("padding-right", `-${width/2}px`);

      const createChildrens = function(){
        let childLink = svg.append("g") 
          .attr("class", "childLinks")
          .selectAll("line")
          .data(d.childrenLinks)
          .enter().append("line")
          .attr("stroke", function(d) { return color(d.weight); })
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", function(d) { return Math.sqrt(d.value); });
        let childNode = svg.append("g")
          .attr("class", "nodesChildrens")
          .selectAll("circle")
          .data(d.children)
          .enter()
          .append("circle")
          // .attr("r", function(d) { return Math.sqrt(d.weight); })
          .attr("r", function(d) { if (!isMobile) {
            var nodeRadius = d.weight/2700 * width/25;} else {nodeRadius = d.weight/2700 * width/12;} return nodeRadius })
          .attr("fill", "#fff");
        var labelNodeChildren = svg.append("g").attr("class", "labelNodesChildrens")
          .selectAll("text")
          .data(d.children)
          .enter()
          .append("text")
          .text(function(d, i) { return d.label })
          .style("fill", "#555")
          .style("font-family", "Arial")
          .style("font-size", 12)
          .style("pointer-events", "none");

        const nodeCircleschildrenLinksArr = document.querySelectorAll("g.nodesChildrens circle");
        const nodeCircleschildrenArr = document.querySelectorAll("g.childLinks line");
        // console.log(nodeCircleschildrenArr)
        nodeCircleschildrenArr.forEach( (el) => {
          // console.log(childNode)
          childNode
          .attr("cx", function(d, i) {
            if(!isMobile) {
              if(i == 0){
                var circlePosX = d.x + 350
              } else if(i == 1) {
                circlePosX = d.x + 350
              } else if (i == 2) {
                circlePosX = d.x + 350
              }
            } else {
              if(i == 0){
                var circlePosX = d.x - 150
              } else if(i == 1) {
                circlePosX = d.x - 200
              } else if (i == 2) {
                circlePosX = d.x - 150
              }
            }
            // console.log(width)
            
            return circlePosX
          })
          .attr("cy", function(d, i) {
            if(!isMobile) {
              if(i == 0){
                var circlePosY = d.y - 200
              } else if(i == 1) {
                circlePosY = d.y - 100
              } else if (i == 2) {
                circlePosY = d.y
              }
            } else {
              if(i == 0){
                var circlePosY = d.y - 50
              } else if(i == 1) {
                circlePosY = d.y - 50
              } else if (i == 2) {
                circlePosY = d.y
              }
            }
            
            return circlePosY
          });

          
        });
        nodeCircleschildrenArr.forEach((el) => {
          // console.log(d.children)
          childLink
      
          .attr("x1", function(d) { if(!isMobile) { var x1 = d.x;} else {x1 = d.x;} return x1 })
          .attr("y1", function(d) { if(!isMobile) { var y1 = d.y;} else {y1 = d.y;} return y1 })
          // .attr("x2", function(d) { if(!isMobile) { var x2 = d.target.x + 300;} else {x2 = d.target.x + 100;} return x2 })
          // .attr("y2", function(d) { if(!isMobile) { var y2 = d.target.y + 100;} else {y2 = d.target.y + 100;} return y2 });
        })
      }
      setTimeout(createChildrens, 700)
  } else {
    console.log("do not have children")
      // d.children = d._children;
      // d._children = null;
  }

  // update(d);
}

function fixna(x) {
  if (isFinite(x)) return x;
  return 0;
}

function updateNode(node) {
  var nodeTextArr = document.querySelectorAll("text");
  // console.log(node)
    nodeTextArr.forEach( (el, i) => {
      node.attr("transform", function(d, i) {
        if(!isMobile) {
          if(i == 0){
            var textTransform = `translate(${fixna(d.x - el.clientWidth * 1.5  - 200)}, ${fixna(d.y - 50)} )`
          } else if(i == 1) {
            textTransform = `translate(${fixna(d.x - el.clientWidth * 0.3 + 300)}, ${fixna(d.y + 100 + 50)} )`
          } else if (i == 2) {
            textTransform = `translate(${fixna(d.x - el.clientWidth + 300)}, ${fixna(d.y + 100)} )`
          }
        } else {
          if(i == 0){
            var textTransform = `translate(${fixna(d.x - 200)}, ${fixna(d.y - 150)} )`
          } else if(i == 1) {
            textTransform = `translate(${fixna(d.x + 100)}, ${fixna(d.y + 110)} )`
          } else if (i == 2) {
            textTransform = `translate(${fixna(d.x)}, ${fixna(d.y + 100)} )`
          }
        }
        
        return textTransform
      })
    });
  }
function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.8).restart();
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


function updateChildrenNode(childNode) {

}





// background animation

  // particlesJS("particles-js-1", {
  //             "particles": {
  //                 "number": {
  //                     "value": 222,
  //                     "density": {
  //                         "enable": true,
  //                         "value_area": 555
  //                     }
  //                 },
  //                 "color": {
  //                     "value": "#ffffff"
  //                 },
  //                 "shape": {
  //                     "type": "circle",
  //                     "stroke": {
  //                         "width": 0,
  //                         "color": "#000000"
  //                     },
  //                     "polygon": {
  //                         "nb_sides": 3
  //                     },
  //                     "image": {
  //                         "src": "img/github.svg",
  //                         "width": 100,
  //                         "height": 100
  //                     }
  //                 },
  //                 "opacity": {
  //                     "value": 0.99,
  //                     "random": true,
  //                     "anim": {
  //                         "enable": false,
  //                         "speed": 1,
  //                         "opacity_min": 0.1,
  //                         "sync": false
  //                     }
  //                 },
  //                 "size": {
  //                     "value": 1.999,
  //                     "random": true,
  //                     "anim": {
  //                         "enable": true,
  //                         "speed": 3,
  //                         "size_min": 0.1,
  //                         "sync": false
  //                     }
  //                 },
  //                 "line_linked": {
  //                     "enable": true,
  //                     "distance": 32,
  //                     "color": "#ffffff",
  //                     "opacity": 0.77,
  //                     "width": 0.99
  //                 },
  //                 "move": {
  //                     "enable": true,
  //                     "speed": 0.777,
  //                     "direction": "left",
  //                     "random": true,
  //                     "straight": false,
  //                     "out_mode": "out",
  //                     "bounce": false,
  //                     "attract": {
  //                         "enable": true,
  //                         "rotateX": 10000,
  //                         "rotateY": 10000
  //                     }
  //                 }
  //             },
  //             "interactivity": {
  //                 "detect_on": "window",
  //                 "events": {
  //                     "onhover": {
  //                         "enable": true,
  //                         "mode": "bubble"
  //                     },
  //                     "onclick": {
  //                         "enable": true,
  //                         "mode": "push"
  //                     },
  //                     "resize": true
  //                 },
  //                 "modes": {
  //                     "grab": {
  //                         "distance": 400,
  //                         "line_linked": {
  //                             "opacity": 1
  //                         }
  //                     },
  //                     "bubble": {
  //                         "distance": 555,
  //                         "size": 3.33,
  //                         "duration": 5,
  //                         "opacity": 0.9,
  //                         "speed": 3
  //                     },
  //                     "repulse": {
  //                         "distance": 666,
  //                         "duration": 0.4
  //                     },
  //                     "push": {
  //                         "particles_nb": 4
  //                     },
  //                     "remove": {
  //                         "particles_nb": 2
  //                     }
  //                 }
  //             },
  //             "retina_detect": true
  //         });

  //       particlesJS("particles-js-2", {
  //           "particles": {
  //               "number": {
  //                   "value": 100,
  //                   "density": {
  //                       "enable": true,
  //                       "value_area": 800
  //                   }
  //               },
  //               "color": {
  //                   "value": "#ffffff"
  //               },
  //               "shape": {
  //                   "type": "circle",
  //                   "stroke": {
  //                       "width": 0,
  //                       "color": "#000000"
  //                   },
  //                   "polygon": {
  //                       "nb_sides": 5
  //                   },
  //                   "image": {
  //                       "src": "img/github.svg",
  //                       "width": 100,
  //                       "height": 100
  //                   }
  //               },
  //               "opacity": {
  //                   "value": 0.7,
  //                   "random": false,
  //                   "anim": {
  //                       "enable": false,
  //                       "speed": 1,
  //                       "opacity_min": 0.1,
  //                       "sync": false
  //                   }
  //               },
  //               "size": {
  //                   "value": 5,
  //                   "random": true,
  //                   "anim": {
  //                       "enable": false,
  //                       "speed": 40,
  //                       "size_min": 0.1,
  //                       "sync": false
  //                   }
  //               },
  //               "line_linked": {
  //                   "enable": true,
  //                   "distance": 40,
  //                   "color": "#ffffff",
  //                   "opacity": 1,
  //                   "width": 0.75
  //               },
  //               "move": {
  //                   "enable": true,
  //                   "speed": 0.53,
  //                   "direction": "left",
  //                   "random": false,
  //                   "straight": false,
  //                   "out_mode": "out",
  //                   "bounce": false,
  //                   "attract": {
  //                       "enable": false,
  //                       "rotateX": 600,
  //                       "rotateY": 1200
  //                   }
  //               }
  //           },
  //           "interactivity": {
  //               "detect_on": "window",
  //               "events": {
  //                   "onhover": {
  //                       "enable": true,
  //                       "mode": "bubble"
  //                   },
  //                   "onclick": {
  //                       "enable": true,
  //                       "mode": "push"
  //                   },
  //                   "resize": true
  //               },
  //               "modes": {
  //                   "grab": {
  //                       "distance": 400,
  //                       "line_linked": {
  //                           "opacity": 1
  //                       }
  //                   },
  //                   "bubble": {
  //                       "distance": 155,
  //                       "size": 10,
  //                       "duration": 10,
  //                       "opacity": 0.8,
  //                       "speed": 1
  //                   },
  //                   "repulse": {
  //                       "distance": 111.8881118881119,
  //                       "duration": 0.4
  //                   },
  //                   "push": {
  //                       "particles_nb": 4
  //                   },
  //                   "remove": {
  //                       "particles_nb": 2
  //                   }
  //               }
  //           },
  //           "retina_detect": true
  //       });
  // 