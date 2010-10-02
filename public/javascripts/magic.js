var iterator = 0;
var box_id = "";
var container_id = "";

$(document).ready(function(){
  events();
  // append_container_to_page();
  var content = load(4);
  $('#page')
    .append(content)
    .append(clear_div());

  box_id = max_id('.box');
  container_id = max_id('.container.horizontal, .container.vertical, .container.simple');
})


// create elements

var clear_div = function(){
  return $('<div class="clear">');
}

var create_text_box = function(){
  var e = {};
  e.box = $('<div class="box">');
  e.header = $('<div class="header">');
  e.buttons = $('<ul class="buttons">')
    .append($('<li class="left button">').html("&larr;"))
    .append($('<li class="right button">').html("&rarr;"))
    .append($('<li class="up button">').html("&uarr;"))
    .append($('<li class="down button">').html("&darr;"));
  e.remove = $('<div class="remove">');
  e.remove_button = $('<div class="remove_button">');
  e.triangle = $('<div class="triangle">');
  e.body = $('<div class="body">');
  e.content = $('<div class="content">');


  e.content.attr('contenteditable', 'true');
  e.box.attr('id', ++box_id);

  e.remove
    .append(e.remove_button);

  e.header
    .append(e.remove)
    .append(e.buttons)
    .append(clear_div());

  e.body
    .append(e.content)
    .append(e.triangle);

  e.box
    .append(e.header)
    .append(e.body);

  e.buttons.hide();
  e.remove.hide();
  e.triangle.hide();

  return e.box;
}

var create_simple_container = function(){
  var container = $('<div class="simple container">');
  var text_box = create_text_box();

  container.attr('id', ++container_id)

  container
    .append(text_box);

  return container;
}

var create_horizontal_container = function(){
  var h_container = $('<div class="horizontal container">');
  var a_container = create_simple_container();
  var v_divider = $('<div class="vertical divider">');
  var b_container = create_simple_container();

  h_container.attr('id', ++container_id);
  a_container.addClass('a');
  b_container.addClass('b');

  h_container
    .append(a_container)
    .append(v_divider)
    .append(b_container)
    .append(clear_div())

  return h_container;
}

var create_vertical_container = function(){
  var v_container = $('<div class="vertical container">');
  var a_container = create_simple_container();
  var h_divider = $('<div class="horizontal divider">');
  var b_container = create_simple_container();

  v_container.attr('id', ++container_id);
  a_container.addClass('a');
  b_container.addClass('b');

  v_container
    .append(a_container)
    .append(clear_div())
    .append(h_divider)
    .append(clear_div())
    .append(b_container)
    .append(clear_div())

  return v_container;
}


// helper methods

var get_parent = function(container){
  return container.parent('.container');
}

var get_siblings = function(container){
  var children = container.children('.container')
  var c = {};
  c.a = $(children[0]);
  c.b = $(children[1]);
  return c;
}

var get_properties = function(c){
  var container = {}
  container.jq = c;

  container.position = container.jq.hasClass('b') ? 'b' : 'a';
  container.width       = parseInt(container.jq.css("width"));
  container.height      = parseInt(container.jq.css("height"));
  container.min_width   = parseInt(container.jq.css("min-width"));
  container.append_new_width = (container.width - 20) / 2; 
  container.remove_new_width = (container.width * 2) + 20;

  return container;
}

var resize_container = function(width, container){
  console.log('initial: ' + container.attr('class'));
  console.log(container)

  if (container.hasClass("simple")) {
    console.log('simple');
    var c_width = parseInt(container.css("width"));
    var new_width = c_width + width + 20;
    container.css("width", new_width);

  } else if (container.hasClass("horizontal")) {
    console.log('horizontal')
    var h_width = (width - 20) / 2;
    $.each(container.children('.container'), function(index, i_container){
      resize_container(h_width, $(i_container))
    });

  } else if (container.hasClass("vertical")) {
    console.log('vertical')
    $.each(container.children('.container'), function(index, i_container){
      resize_container(width, $(i_container));
    })
  } else {
    console.log("fuck: resize_container")
  }
}

var run_tests = function(){

  // a horizontal or vertical container does not have two children
  $.each($('.horizontal.container, .vertical.container'), function(index, container){
    if($(container).children('.container').length != 2){
      alert('a complex container has the wrong number of children!');
    }
  });

  // a horizontal or vertical container has two children with the same position
  $.each($('.horizontal.container, .vertical.container'), function(index, container){
    if(($(container).children('.a').length == 2) || ($(container).children('.b').length == 2)){
      alert('a complex container has two a or two b chilren!');
    }
  });

  // B before A 
  $.each($('.horizontal.container, .vertical.container'), function(index, container){
    var children = $(container).children('.container')
    if($(children[0]).hasClass('b') || $(children[1]).hasClass('a') ){
      alert('a complex container has its chilren out of order');
    }
  });

  // missing a divider
  $.each($('.horizontal.container, .vertical.container'), function(index, container){
    if($(container).children('.divider').length == 0){
      alert('a complex container is missing a divider');
    }
  });
}




// actions + events

var additive = function(button, container){
  var new_container_type = (button == 'up' || button == 'down') ? 'vertical' : 'horizontal'
  var original_container_position = (button == 'right' || button == 'down') ? 'a' : 'b';

  var original_container  = {};
  original_container.jq   = container;
  original_container._    = get_properties(original_container.jq);

  if ((new_container_type == 'vertical') || (original_container._.append_new_width >= original_container._.min_width)){
    var new_container = {};
    new_container.jq = (new_container_type == 'vertical') ? create_vertical_container() : create_horizontal_container();
    new_container.original = original_container
      .jq.clone().
      removeClass('a b').addClass(original_container_position)
      .removeAttr('width');
    new_container.sibling = get_siblings(new_container.jq);

    // swap in original container
    new_container.sibling[original_container_position].replaceWith(new_container.original);
    new_container.sibling = get_siblings(new_container.jq);

    // set new_containers position
    new_container.jq.addClass(original_container._.position);

    // set sibling properties
    var sibling_width = (new_container_type == 'vertical') ? 'width' : 'append_new_width';
    new_container.sibling.a.css('width', original_container._[sibling_width]);
    new_container.sibling.b.css('width', original_container._[sibling_width]);

    // replace original_container with h_container
    original_container.jq.replaceWith(new_container.jq);
    run_tests();

  }
}

var remove_container = function(container){
  var original_container = {};
  original_container.jq  = container;
  original_container._   = get_properties(original_container.jq);

  var parent_container  = {};
  parent_container.jq   = get_parent(original_container.jq);
  parent_container._    = get_properties(parent_container.jq);
  parent_container.other_position = (original_container._.position == 'a') ? 'b' : 'a';
  parent_container.sibling = get_siblings(parent_container.jq);

  // other_container
  var other_container = {};
  other_container.jq  = parent_container.sibling[parent_container.other_position];
  other_container._   = get_properties(other_container.jq);


  // set new position
  other_container.jq.removeClass('a b').addClass(parent_container._.position);


  // set new width
   if(parent_container.jq.hasClass('horizontal')){
     resize_container(original_container._.width, other_container.jq);
   }

  // replace parent container (H or V) with the other sibling container
  parent_container.jq.replaceWith(other_container.jq);
  run_tests()
}

var events = function(){

  // page
  $('#page').mouseup(function(){
    $('#page').unbind('mousemove');
    $('.triangle_on').removeClass('triangle_on');
  })


  //  container
  $('.container').live('mouseover', function(){
  });

  $('.container').live('mouseout', function(){
    $('.buttons').hide();
  });


  // box
  $('.box').live('mouseover', function(){
    $('.triangle').hide();
    $('.triangle', this).show();
  });

  $('.box').live('mouseout', function(){
  });

  // header
  $('.header').live('mouseover', function(){
    $('.buttons, .remove').hide();
    $('.buttons, .remove', this).show();

    $('.header').removeClass('hover');
    $(this).addClass('hover');
  });

  $('.header').live('mouseout', function(){
    $('.buttons, .remove', this).hide();
    $('.header').removeClass('hover');
  });


  $('.button').live('click', function(){
    direction = $(this).attr('class').split(" ")[0];
    additive(direction, $(this).closest('.container'))
  });

  $('.remove').live('click', function(){
    if($('.box').length > 1){
      remove_container($(this).closest('.container'));
    }
  });

  $('.triangle').live('mousedown',function(d){

    var triangle_y_position = d.pageY;
    var body = $(this).closest('.body');
    var body_height = parseInt(body.css('height'));
    var buffer_y_position = triangle_y_position - body_height;

    $('#page, .box, .header, ul, li').addClass('triangle_on');

    $('#page').bind('mousemove', function(e){
      var current_position = e.pageY;
      body_height = current_position - buffer_y_position;
      body.css('min-height', body_height)
    });
  })

}


// load

var get_page_id = function(){
  return parseInt($('#page_id').text());
}

var load = function(id){
  var container = {};
  container.properties = elements.container[id];

  if (container.properties.type == "simple"){
    // create simple container
    container.jq = create_simple_container();
    container.box = {};
    container.box.properties = elements.box[container.properties.a_child];

    // properties
    container.jq
      .css('width', container.box.properties.width)
      .addClass(container.properties.position)
      .attr('id', container.properties.id);

    $('.box', container.jq)
      .attr('id', container.box.properties.id);

    $('.body', container.jq)
      .css('min-height', container.box.properties.min_height);

    $('.content', container.jq)
      .html(container.box.properties.content);


    return container.jq;
  } 
  else {
    // create complex container
    container.jq = (container.properties.type == "vertical") ? create_vertical_container() : create_horizontal_container();
    container.sibling = get_siblings(container.jq);
    container.new_a = load(container.properties.a_child);
    container.new_b = load(container.properties.b_child);

    container.jq
      .addClass(container.properties.position)
      .attr('id', container.properties.id);

    container.new_a
      .addClass('a');

    container.new_b
      .addClass('b');


    container.sibling.a.replaceWith(container.new_a);
    container.sibling.b.replaceWith(container.new_b);
    return container.jq;
  }
};

var max_id = function(selector){
  var elements = $(selector);
  elements = $.map(elements, function(value, index){return $(value).attr('id')});

  Array.max = function( array ){
      return Math.max.apply( Math, array );
  };

  return Array.max(elements)
}

var save = function(){
  var elements = {};
  elements.container = {}
  elements.box = {};
  elements.root_id = '';

  var containers = $('.horizontal.container, .vertical.container, .simple.container');
  var boxes = $('.box');

  $.each(containers, function(index, value){
    var element   = {};
    element_jq    = $(value);

    element.id    = parseInt(element_jq.attr('id'));
    element.type  = element_jq.hasClass('horizontal') ? 'horizontal' : (element_jq.hasClass('vertical') ? 'vertical' : 'simple');
    element.position  = element_jq.hasClass('a') ? 'a' : 'b';
    element.a_child   = parseInt(element_jq.children('.a, .box').attr('id'));
    element.b_child   = parseInt(element_jq.children('.b').attr('id')) || "";
    elements.container[element.id] = element
  });

  $.each(boxes, function(index, value){
    var element = {}
    var element_jq = $(value);

    element.width = parseInt(element_jq.parent('.container').css('width'));
    element.id = parseInt(element_jq.attr('id'));
    element.min_height = parseInt(element_jq.children('.body').css('min-height'));
    element.content = element_jq.find('.content').html();
    elements.box[element.id] = element;
  })

  return elements
}


// sample content
elements = {"container":{"1":{"id":1,"type":"simple","position":"a","a_child":1,"b_child":""},"3":{"id":3,"type":"simple","position":"a","a_child":3,"b_child":""},"4":{"id":4,"type":"horizontal","position":"a","a_child":10,"b_child":7},"6":{"id":6,"type":"simple","position":"a","a_child":5,"b_child":""},"7":{"id":7,"type":"horizontal","position":"b","a_child":13,"b_child":16},"9":{"id":9,"type":"simple","position":"b","a_child":7,"b_child":""},"10":{"id":10,"type":"vertical","position":"a","a_child":1,"b_child":9},"12":{"id":12,"type":"simple","position":"b","a_child":9,"b_child":""},"13":{"id":13,"type":"vertical","position":"a","a_child":3,"b_child":12},"15":{"id":15,"type":"simple","position":"b","a_child":11,"b_child":""},"16":{"id":16,"type":"vertical","position":"b","a_child":6,"b_child":15}},"box":{"1":{"width":490,"id":1,"min_height":200,"content":"<span><span style=\"color: rgb(37, 62, 95); font-size: 16px; \">Boxes &amp; Bins</span><br><span style=\"color: rgb(68, 68, 68); font-size: 14px; \">MS Word 2.0</span></span>"},"3":{"width":235,"id":3,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\">How do I create new boxes?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span></span></font><div><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \">Hover over the box's header and click on an arrow.</span></span></font></div>"},"5":{"width":235,"id":5,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\">How do I remove a box?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span></span></font><div><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \">Hover over the box's header and click on the circle.</span></span></font></div>"},"7":{"width":490,"id":7,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\"><br></font>"},"9":{"width":235,"id":9,"min_height":320,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\">Why Boxes &amp; Bins?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">Boxes &amp; Bins is a contextual text-editor, which means that drafting documents in BB is one part content and one part context.&nbsp;</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">In other words, if you're not moving boxes around the page, you're doing it wrong.</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">I hope to build Boxes &amp; Bins into a full-fledged publishing environment.</span></font></div>"},"11":{"width":235,"id":11,"min_height":319,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\"><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(95, 26, 8); font-size: medium; \">Give us feedback!</span></span></font></font><div><font class=\"Apple-style-span\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\"><br></font></font><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \">Boxes &amp; Bins begun as a small side-project last weekend. If you're playing around with BB we'd love to hear from you!</span></div></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \"><br></span></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\"><a class=\"Apple-style-span\" style=\"font-size: 14px;\" href=\"https://spreadsheets.google.com/viewform?formkey=dGJycFlwRjR4TVRnYlN5dHh4SDg1T2c6MQ\">Feedback!</a></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \"><br></span></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-family: Helvetica; \"><div style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font></div></div>"}},"root_id":""}
// preview mode

var preview_mode = function(){
  $('#page, .box, .header, .body').addClass('preview')
}

