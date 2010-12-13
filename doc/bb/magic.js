var iterator = 0;
var box_id = "";
var container_id = "";

$(document).ready(function(){
  events();
  // append_container_to_page();
  var content = load(4, e5);
  $('#page')
    .append(content)
    .append(clear_div());
  // $('#flash').hide()
  // load_page(content)
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
  return $(container.parent('.container'));
}

var get_siblings = function(container){
  var children = container.children('.container')
  var c = {};
  c.a = $(children[0]);
  c.b = $(children[1]);
  return c;
}

var get_other_sibling = function(container){
  var parent = get_parent(container);
  var siblings = get_siblings(parent);
  var other_sibling = container.hasClass('a') ? siblings.b : siblings.a;

  console.log('found other sibling')
  return other_sibling
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

    // var container = $($(this).closest('.container'));
    // var other_container = get_other_sibling(container);
        
    var triangle_y_position = d.pageY;
    var triangle_x_position = d.pageX;

    var body = $(this).closest('.body');
    var body_height = parseInt(body.css('height'));
    var body_width = parseInt(body.css('width'));

    var buffer_y_position = triangle_y_position - body_height;
    var buffer_x_position = triangle_x_position - body_width;

    $('#page, .box, .header, ul, li, .content, .body')
      .addClass('triangle_on');

    $('#page').bind('mousemove', function(e){
      var current_y_position = e.pageY;
      var current_x_position = e.pageX;
      
      var old_height = body_height;
      var old_width = body_width;
      
      body_height = current_y_position - buffer_y_position;
      body_width = current_x_position - buffer_x_position;

      body.css('min-height', body_height)
      
      // container.css('width', body_width);        
      // resize_container((body_width - old_width), other_container)
      // console.log((body_height - old_height) + " " + (body_width - old_width))

      
    });
  })
}


// load

var get_page_id = function(){
  return parseInt($('#page_id').text());
}

var get_user_id = function(){
  return parseInt($('#user_id').text());
}

var get_root_id = function(){
  return parseInt($('#page > .container').attr('id'));
}

var get_page_title = function(){
  return $('#page_title input').val()
}

var set_page_title = function(title){
  $('#page_title input').val(title);
}


var load = function(id, elements){
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
    console.log('complex');
    // create complex container
    container.jq = (container.properties.type == "vertical") ? create_vertical_container() : create_horizontal_container();
    container.sibling = get_siblings(container.jq);
    container.new_a = load(container.properties.a_child, elements);
    container.new_b = load(container.properties.b_child, elements);

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
  elements.root_id = get_root_id();
  elements.page_title = get_page_title();

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

var load_request = function(){
  console.log('start load request 1');
  var user_id = get_user_id();
  var page_id = get_page_id();
  var url = sprintf("/pages/load/%s/%s", user_id, page_id);

  console.log('initiate get request ' + url)
  $.get(url, function(data){
      console.log('data returned')
      data = JSON.parse(data);
      console.log(data)
      load_page(data.root, data);
  });
}

var save_request = function(){
  var elements = JSON.stringify(save());
  var user_id = get_user_id();
  var page_id = get_page_id();
  $.post('/pages/save/'
  , {
    'user_id': user_id,
    'page_id': page_id,
    'uid': uid,
    'data': elements
  }, function(data) {
      console.log('save request succeeded');
      $('#flash').fadeIn(1000, function(){
        setTimeout(function(){ 
          $('#flash').fadeOut(1000) 
        }, 4000);
      })
  });
}

var new_page = function(){
  load_page(1, e2);
}

var load_page = function(json){
  var root = json.root;
  var content = load(root, json);
 
  set_page_title(json.title);
  $('#page')
    .html(content)
    .append(clear_div());
}

// sample content
// var e1 = {"container":{"1":{"id":1,"type":"simple","position":"a","a_child":1,"b_child":""},"3":{"id":3,"type":"simple","position":"a","a_child":3,"b_child":""},"4":{"id":4,"type":"horizontal","position":"a","a_child":10,"b_child":7},"6":{"id":6,"type":"simple","position":"a","a_child":5,"b_child":""},"7":{"id":7,"type":"horizontal","position":"b","a_child":13,"b_child":16},"9":{"id":9,"type":"simple","position":"b","a_child":7,"b_child":""},"10":{"id":10,"type":"vertical","position":"a","a_child":1,"b_child":9},"12":{"id":12,"type":"simple","position":"b","a_child":9,"b_child":""},"13":{"id":13,"type":"vertical","position":"a","a_child":3,"b_child":12},"15":{"id":15,"type":"simple","position":"b","a_child":11,"b_child":""},"16":{"id":16,"type":"vertical","position":"b","a_child":6,"b_child":15}},"box":{"1":{"width":490,"id":1,"min_height":200,"content":"<span><span style=\"color: rgb(37, 62, 95); font-size: 16px; \">Boxes &amp; Bins</span><br><span style=\"color: rgb(68, 68, 68); font-size: 14px; \">MS Word 2.0</span></span>"},"3":{"width":235,"id":3,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\">How do I create new boxes?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span></span></font><div><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \">Hover over the box's header and click on an arrow.</span></span></font></div>"},"5":{"width":235,"id":5,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\">How do I remove a box?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span></span></font><div><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \">Hover over the box's header and click on the circle.</span></span></font></div>"},"7":{"width":490,"id":7,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\"><br></font>"},"9":{"width":235,"id":9,"min_height":320,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\">Why Boxes &amp; Bins?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">Boxes &amp; Bins is a contextual text-editor, which means that drafting documents in BB is one part content and one part context.&nbsp;</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">In other words, if you're not moving boxes around the page, you're doing it wrong.</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">I hope to build Boxes &amp; Bins into a full-fledged publishing environment.</span></font></div>"},"11":{"width":235,"id":11,"min_height":319,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\"><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(95, 26, 8); font-size: medium; \">Give us feedback!</span></span></font></font><div><font class=\"Apple-style-span\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\"><br></font></font><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \">Boxes &amp; Bins begun as a small side-project last weekend. If you're playing around with BB we'd love to hear from you!</span></div></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \"><br></span></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\"><a class=\"Apple-style-span\" style=\"font-size: 14px;\" href=\"https://spreadsheets.google.com/viewform?formkey=dGJycFlwRjR4TVRnYlN5dHh4SDg1T2c6MQ\">Feedback!</a></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \"><br></span></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-family: Helvetica; \"><div style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font></div></div>"}},"root_id":""}
// var e2 = {"box":{"1":{"width":1000,"content":"","min_height":200,"id":1}},"container":{"1":{"type":"simple","b_child":null,"a_child":1,"position":"a","id":1}},"root":1}
// var e3 = {"container":{"1":{"id":1,"type":"simple","position":"a","a_child":1,"b_child":""},"3":{"id":3,"type":"simple","position":"a","a_child":3,"b_child":""},"4":{"id":4,"type":"horizontal","position":"a","a_child":10,"b_child":7},"6":{"id":6,"type":"simple","position":"a","a_child":5,"b_child":""},"7":{"id":7,"type":"horizontal","position":"b","a_child":13,"b_child":16},"9":{"id":9,"type":"simple","position":"b","a_child":7,"b_child":""},"10":{"id":10,"type":"vertical","position":"a","a_child":1,"b_child":9},"12":{"id":12,"type":"simple","position":"b","a_child":9,"b_child":""},"13":{"id":13,"type":"vertical","position":"a","a_child":3,"b_child":12},"15":{"id":15,"type":"simple","position":"b","a_child":11,"b_child":""},"16":{"id":16,"type":"vertical","position":"b","a_child":6,"b_child":15}},"box":{"1":{"width":490,"id":1,"min_height":200,"content":"<span><span style=\"color: rgb(37, 62, 95); font-size: 16px; \">Boxes &amp; Bins</span><br><span style=\"color: rgb(68, 68, 68); font-size: 14px; \">MS Word 2.0</span></span>"},"3":{"width":235,"id":3,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\">How do I create new boxes?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span></span></font><div><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \">Hover over the box's header and click on an arrow.</span></span></font></div>"},"5":{"width":235,"id":5,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\">How do I remove a box?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span></span></font><div><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \">Hover over the box's header and click on the circle.</span></span></font></div>"},"7":{"width":490,"id":7,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\"><br></font>"},"9":{"width":235,"id":9,"min_height":320,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\">Why Boxes &amp; Bins?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">Boxes &amp; Bins is a contextual text-editor, which means that drafting documents in BB is one part content and one part context.&nbsp;</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">In other words, if you're not moving boxes around the page, you're doing it wrong.</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">I hope to build Boxes &amp; Bins into a full-fledged publishing environment.</span></font></div>"},"11":{"width":235,"id":11,"min_height":319,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\"><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(95, 26, 8); font-size: medium; \">Give us feedback!</span></span></font></font><div><font class=\"Apple-style-span\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\"><br></font></font><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \">Boxes &amp; Bins begun as a small side-project last weekend. If you're playing around with BB we'd love to hear from you!</span></div></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \"><br></span></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\"><a class=\"Apple-style-span\" style=\"font-size: 14px;\" href=\"https://spreadsheets.google.com/viewform?formkey=dGJycFlwRjR4TVRnYlN5dHh4SDg1T2c6MQ\">Feedback!</a></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \"><br></span></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-family: Helvetica; \"><div style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font></div></div>"}},"root_id":""}
// var e4 = {"container":{"1":{"id":1,"type":"simple","position":"a","a_child":1,"b_child":""},"9":{"id":9,"type":"simple","position":"a","a_child":7,"b_child":""},"10":{"id":10,"type":"vertical","position":"a","a_child":1,"b_child":19},"19":{"id":19,"type":"vertical","position":"b","a_child":9,"b_child":25},"21":{"id":21,"type":"simple","position":"a","a_child":15,"b_child":""},"24":{"id":24,"type":"simple","position":"a","a_child":17,"b_child":""},"25":{"id":25,"type":"vertical","position":"b","a_child":21,"b_child":28},"27":{"id":27,"type":"simple","position":"a","a_child":19,"b_child":""},"28":{"id":28,"type":"vertical","position":"b","a_child":46,"b_child":58},"45":{"id":45,"type":"simple","position":"b","a_child":31,"b_child":""},"46":{"id":46,"type":"horizontal","position":"a","a_child":49,"b_child":45},"48":{"id":48,"type":"simple","position":"b","a_child":33,"b_child":""},"49":{"id":49,"type":"vertical","position":"a","a_child":24,"b_child":48},"57":{"id":57,"type":"simple","position":"b","a_child":39,"b_child":""},"58":{"id":58,"type":"vertical","position":"b","a_child":27,"b_child":57}},"box":{"1":{"width":1000,"id":1,"min_height":200,"content":"<span><span style=\"color: rgb(37, 62, 95); font-size: 16px; \">2nd Day Notes</span><br><span style=\"color: rgb(68, 68, 68); font-size: 14px; \">Lorem Ipsum</span></span><div><span><span style=\"color: rgb(68, 68, 68); font-size: 14px; \"><br></span></span></div>"},"7":{"width":1000,"id":7,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; color: rgb(37, 62, 95); font-size: 16px; \">Ethics Compliance</span><br><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \">Lorem Ipsum</span></span></font>"},"15":{"width":1000,"id":15,"min_height":0,"content":"<meta charset=\"utf-8\"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; color: rgb(37, 62, 95); font-size: 16px; \">Shareholder&nbsp;Responsibility&nbsp;</span><br><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \">Efficiency</span><div><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \"><br></span></div><div><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \"><br></span></div>"},"17":{"width":490,"id":17,"min_height":0,"content":"<meta charset=\"utf-8\"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; color: rgb(37, 62, 95); font-size: 16px; \">Culture</span><br><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px; \"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px; \">How to talk to people outside the company about what it's like to work here?</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">Facilitate a better conversation with the company.&nbsp;</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">How we want to be when we grow up.</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">How do we want to tell our story to the rest of the world.&nbsp;</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div>"},"19":{"width":1000,"id":19,"min_height":0,"content":"<meta charset=\"utf-8\"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; color: rgb(37, 62, 95); font-size: 16px; \">Big Picture</span><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"4\"></font><br><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">The future&nbsp;mimics&nbsp;the past</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">communities:&nbsp;</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">&nbsp;&nbsp;1. information</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">&nbsp;&nbsp;2. capital</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">&nbsp;&nbsp;3. power</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">can measure value/output of community</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">rewiring the laws of communities</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">- mechanics information share</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">- mechanics for capital</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">- mechanics behind reputation creation/sharing</span></font></div>"},"31":{"width":490,"id":31,"min_height":595,"content":"<meta charset=\"utf-8\"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(37, 62, 95); font-size: 16px; \">Values</span><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; \"></span><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \">Who we wanted to be, how we wanted to work</span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; \"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; \"></span><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \">Words showed up that became part of the company conversation</span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; \"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; color: rgb(68, 68, 68); \">\"you guys have a learning culture\" == iteration</span></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; color: rgb(37, 62, 95); font-size: 16px; \">BUILD TRUST</span></span></font></div></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \">Without the trust of our users we have nothing</span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \">This is our currency</span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \">\"if I had asked my users what they wanted, they would have said a faster horse\"</span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \">News feed, 20% of users protested, stanford protest&nbsp;</span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(37, 62, 95); font-size: 16px; \">FOCUS ON IMPACT</span><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \">The list of crap that you can't get to should scare you</span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \">(Facebook enterprise)</span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(37, 62, 95); font-size: 16px; \">MOVE FAST</span><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \">He continues to push the company towards breaking things</span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \">Longterm competitive advantage is speed</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \">Short-term speed does not matter unless it&nbsp;accelerates&nbsp;us longterm</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \">&nbsp;&nbsp;(BE BOLD)</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \">&nbsp;&nbsp;(MAKE HUGE BETS)</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \">&nbsp;&nbsp;(BEACON -&gt; CONNECT -&gt; LIKE -&gt; Instant Personalization)</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-size: 14px; \"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(37, 62, 95); font-size: 16px; \">BE OPEN</span><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">openness is hard</span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">openness in the company is for real</span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">company-wide debate</span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div></span></span></font></div></span></span></font></div></span></span></font></div>"},"33":{"width":490,"id":33,"min_height":0,"content":"<meta charset=\"utf-8\"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(37, 62, 95); font-size: 16px; \">Story</span><br><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \">Context around us</span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \">- THREE PHASES (investment phase, scale, slow down)</span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; \"><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \">- the fight (ftc, instant personalization)<br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\" size=\"4\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font></div>"},"39":{"width":1000,"id":39,"min_height":0,"content":""}},"root_id":""}
var e5 = {"container":{"1":{"id":1,"type":"simple","position":"a","a_child":1,"b_child":""},"3":{"id":3,"type":"simple","position":"a","a_child":3,"b_child":""},"4":{"id":4,"type":"vertical","position":"a","a_child":1,"b_child":7},"6":{"id":6,"type":"simple","position":"b","a_child":5,"b_child":""},"7":{"id":7,"type":"horizontal","position":"b","a_child":3,"b_child":6}},"box":{"1":{"width":1000,"id":1,"min_height":200,"content":"<meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"font-family: georgia, 'times new roman', times, serif; font-size: 10px; color: rgb(51, 51, 51); line-height: 15px; \"><h1 class=\"articleHeadline\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 8px; margin-left: 0px; color: rgb(0, 0, 0); font-size: 2.4em; line-height: 1.083em; font-weight: normal; \"><nyt_headline version=\"1.0\" type=\" \">Leaked Reports Detail Iran\u2019s Aid for Iraqi Militias</nyt_headline></h1><div><nyt_headline version=\"1.0\" type=\" \"><br></nyt_headline></div><div><nyt_headline version=\"1.0\" type=\" \"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-family: georgia, 'times new roman', times, serif; line-height: 22px; font-size: 15px; \">On Dec. 22, 2006, American military officials in Baghdad issued a secret warning: The Shiite militia commander who had orchestrated the kidnapping of officials from Iraq\u2019s Ministry of Higher Education was now hatching plans to take American soldiers hostage.</span></nyt_headline></div><div><nyt_headline version=\"1.0\" type=\" \"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-family: georgia, 'times new roman', times, serif; line-height: 22px; font-size: 15px; \"><br></span></nyt_headline></div><div><nyt_headline version=\"1.0\" type=\" \"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-family: georgia, 'times new roman', times, serif; line-height: 22px; font-size: 15px; \"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"line-height: 15px; font-size: 10px; color: rgb(51, 51, 51); \"><p id=\"nytint-photo003\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 1em; margin-left: 0px; font-size: 1.5em; line-height: 1.467em; color: rgb(0, 0, 0); \">What made the warning especially worrying were intelligence reports saying that the Iraqi militant, Azhar al-Dulaimi, had been trained by the Middle East\u2019s masters of the dark arts of paramilitary operations: the&nbsp;<a href=\"http://topics.nytimes.com/top/reference/timestopics/organizations/i/islamic_revolutionary_guard_corps/index.html?inline=nyt-org\" title=\"More articles about the Islamic Revolutionary Guard Corps.\" class=\"meta-org\" style=\"color: rgb(0, 66, 118); text-decoration: underline; \">Islamic Revolutionary Guards</a>&nbsp;Corps in Iran and<a href=\"http://topics.nytimes.com/top/reference/timestopics/organizations/h/hezbollah/index.html?inline=nyt-org\" title=\"More articles about Hezbollah\" class=\"meta-org\" style=\"color: rgb(0, 66, 118); text-decoration: underline; \">Hezbollah</a>, its Lebanese ally.</p><p style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 1em; margin-left: 0px; font-size: 1.5em; line-height: 1.467em; color: rgb(0, 0, 0); \">\u201cDulaymi reportedly obtained his training from Hizballah operatives near Qum, Iran, who were under the supervision of Iranian Islamic Revolutionary Guard Corps Quds Force (IRGC-QF) officers in July 2006,\u201d the report noted, using alternative spellings of the principals involved.&nbsp;<a class=\"nytint-inlineDocument\" href=\"http://www.nytimes.com/interactive/world/iraq-war-logs.html#report/ABD1B1E9-D673-93B1-757861100C0728BC\" style=\"color: rgb(0, 66, 118); text-decoration: underline; font-size: 10px; font-family: arial, sans-serif; background-image: url(http://graphics8.nytimes.com/images/multimedia/icons/document_icon.gif); background-attachment: initial; background-origin: initial; background-clip: initial; background-color: initial; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 21px; background-position: 6px 50%; background-repeat: no-repeat no-repeat; \">Read the Document \u00bb</a></p><p style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 1em; margin-left: 0px; font-size: 1.5em; line-height: 1.467em; color: rgb(0, 0, 0); \">Five months later, Mr. Dulaimi was tracked down and killed in an American raid in the sprawling Shiite enclave of Sadr City in Baghdad \u2014 but not before four American soldiers had been abducted from an Iraqi headquarters in Karbala and executed in an operation that American military officials say literally bore Mr. Dulaimi\u2019s fingerprints</p></span></span></nyt_headline></div></span>"},"3":{"width":490,"id":3,"min_height":0,"content":"<meta charset=\"utf-8\"><h1 class=\"articleHeadline\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 8px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; color: rgb(0, 0, 0); font-size: 2.4em; line-height: 1.083em; font-weight: normal; font-family: georgia, 'times new roman', times, serif; \"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"line-height: 15px; font-size: 10px; color: rgb(51, 51, 51); \"><h1 class=\"articleHeadline\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 8px; margin-left: 0px; color: rgb(0, 0, 0); font-size: 2.4em; line-height: 1.083em; font-weight: normal; \"><nyt_headline version=\"1.0\" type=\" \">A Grim Portrait of Civilian Deaths in Iraq</nyt_headline></h1></span></h1><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" face=\"georgia, 'times new roman', times, serif\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 15px; line-height: 22px;\"><br></span></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" face=\"georgia, 'times new roman', times, serif\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 15px; line-height: 22px;\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"line-height: 15px; font-size: 10px; color: rgb(51, 51, 51); \"><p style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 1em; margin-left: 0px; font-size: 1.5em; line-height: 1.467em; color: rgb(0, 0, 0); \">The reports in the archive disclosed by WikiLeaks offer an incomplete, yet startlingly graphic portrait of one of the most contentious issues in the Iraq war \u2014 how many Iraqi civilians have been killed and by whom.</p><p style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 1em; margin-left: 0px; font-size: 1.5em; line-height: 1.467em; color: rgb(0, 0, 0); \">The reports make it clear that most civilians, by far, were killed by other Iraqis. Two of the worst days of the war came on Aug. 31, 2005, when&nbsp;<a title=\"Times article.\" href=\"http://www.nytimes.com/2005/09/01/international/middleeast/01iraq.html\" style=\"color: rgb(0, 66, 118); text-decoration: underline; \">a stampede on a bridge in Baghdad killed more than 950 people</a>&nbsp;after several earlier attacks panicked a huge crowd, and on Aug. 14, 2007, when truck bombs&nbsp;<a title=\"Times article.\" href=\"http://www.nytimes.com/2007/08/22/world/middleeast/22iraq.html\" style=\"color: rgb(0, 66, 118); text-decoration: underline; \">killed more than 500 people</a>&nbsp;in a rural area near the border with Syria.</p><p style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 1em; margin-left: 0px; font-size: 1.5em; line-height: 1.467em; color: rgb(0, 0, 0); \">But it was systematic sectarian cleansing that drove the killing to its most frenzied point, making December 2006 the worst month of the war, according to the reports, with about 3,800 civilians killed, roughly equal to the past seven years of murders in New York City. A total of about 1,300 police officers, insurgents and coalition soldiers were also killed in that month.</p><p style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 1em; margin-left: 0px; font-size: 1.5em; line-height: 1.467em; color: rgb(0, 0, 0); \">The documents also reveal many previously unreported instances in which American soldiers killed civilians \u2014 at checkpoints, from helicopters, in operations. Such killings are a central reason Iraqis turned against the American presence in their country, a situation that is now being repeated in Afghanistan.</p><p style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 1em; margin-left: 0px; font-size: 1.5em; line-height: 1.467em; color: rgb(0, 0, 0); \">The archive contains reports on at least four cases of lethal shootings from helicopters. In the bloodiest, on July 16, 2007, as many as 26 Iraqis were killed, about half of them civilians. However, the tally was called in by two different people, and it is possible that the deaths were counted twice.&nbsp;<a class=\"nytint-inlineDocument\" href=\"http://www.nytimes.com/interactive/world/iraq-war-logs.html#report/D1B9DF91-B9EA-1B93-2DA80B02B6F9F5CE\" style=\"color: rgb(0, 66, 118); text-decoration: underline; font-size: 10px; font-family: arial, sans-serif; background-image: url(http://graphics8.nytimes.com/images/multimedia/icons/document_icon.gif); background-attachment: initial; background-origin: initial; background-clip: initial; background-color: initial; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 21px; background-position: 6px 50%; background-repeat: no-repeat no-repeat; \">Read the Document \u00bb</a></p><p style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 1em; margin-left: 0px; font-size: 1.5em; line-height: 1.467em; color: rgb(0, 0, 0); \">In another case, in February 2007, an Apache helicopter shot and killed two Iraqi men believed to have been firing mortars, even though they made surrendering motions, because, according to a military lawyer cited in the report, \u201cthey cannot surrender to aircraft, and are still valid targets.\u201d</p></span></span></font></div>"},"5":{"width":490,"id":5,"min_height":0,"content":"<meta charset=\"utf-8\"><h1 class=\"articleHeadline\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 8px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; color: rgb(0, 0, 0); font-size: 2.4em; line-height: 1.083em; font-weight: normal; font-family: georgia, 'times new roman', times, serif; \"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"line-height: 15px; font-size: 10px; color: rgb(51, 51, 51); \"><h1 class=\"articleHeadline\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 8px; margin-left: 0px; color: rgb(0, 0, 0); font-size: 2.4em; line-height: 1.083em; font-weight: normal; \"><nyt_headline version=\"1.0\" type=\" \">Detainees Fared Worse in Iraqi Hands, Logs Say</nyt_headline></h1></span></h1><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; color: rgb(51, 51, 51); line-height: 15px; \"><nyt_headline version=\"1.0\" type=\" \"><br></nyt_headline></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" face=\"georgia, 'times new roman', times, serif\" size=\"4\"><span class=\"Apple-style-span\" style=\"font-size: 15px; line-height: 22px;\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"line-height: 15px; font-size: 10px; color: rgb(51, 51, 51); \"><p style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 1em; margin-left: 0px; font-size: 1.5em; line-height: 1.467em; color: rgb(0, 0, 0); \">The public image of detainees in Iraq was defined by the photographs, now infamous, of American abuse at Abu Ghraib, like the hooded prisoner and the snarling attack dog. While the documents disclosed by WikiLeaks offer few glimpses of what was happening inside American detention facilities, they do contain indelible details of abuse carried out by Iraq\u2019s army and police.</p><p style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 1em; margin-left: 0px; font-size: 1.5em; line-height: 1.467em; color: rgb(0, 0, 0); \">The six years of reports include references to the deaths of at least six prisoners in Iraqi custody, most of them in recent years. Beatings, burnings and lashings surfaced in hundreds of reports, giving the impression that such treatment was not an exception. In one case, Americans suspected Iraqi Army officers of cutting off a detainee\u2019s fingers and burning him with acid. Two other cases produced accounts of the executions of bound detainees.</p><p style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 1em; margin-left: 0px; font-size: 1.5em; line-height: 1.467em; color: rgb(0, 0, 0); \">And while some abuse cases were investigated by the Americans, most noted in the archive seemed to have been ignored, with the equivalent of an institutional shrug: soldiers told their officers and asked the Iraqis to investigate.</p><p style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 1em; margin-left: 0px; font-size: 1.5em; line-height: 1.467em; color: rgb(0, 0, 0); \">A Pentagon spokesman said American policy on detainee abuse \u201cis and has always been consistent with law and customary international practice.\u201d Current rules, he said, require forces to immediately report abuse; if it was perpetrated by Iraqis, then Iraqi authorities are responsible for investigating.</p><p style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 1em; margin-left: 0px; font-size: 1.5em; line-height: 1.467em; color: rgb(0, 0, 0); \">That policy was made official in a report dated May 16, 2005, saying that if \u201cif US forces were not involved in the detainee abuse, no further investigation will be conducted until directed by HHQ.\u201d In many cases, the order appeared to allow American soldiers to turn a blind eye to abuse of Iraqis on Iraqis.</p><p style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 1em; margin-left: 0px; font-size: 1.5em; line-height: 1.467em; color: rgb(0, 0, 0); \">Even when Americans found abuse and reported it, Iraqis often did not act. One report said a police chief refused to file charges \u201cas long as the abuse produced no marks.\u201d Another police chief told military inspectors that his officers engaged in abuse \u201cand supported it as a method of conducting investigations.\u201d</p></span></span></font></div>"}},"root_id":4,"page_title":"Page Title"}


var inspector = function(){
  console.log("create inspector");
  var inspector = $('div class="inspector"');
  $(body).append(inspector);
}

// var text = '<span class="f16 c4">L</span><span class="f16 c4">o</span><span class="f16 c4">r</span><span class="f16 c4">e</span><span class="f16 c4">m</span><span class="f16 c4"> </span><span class="f16 c4">i</span><span class="f16 c4">p</span><span class="f16 c4">s</span><span class="f16 c4">u</span><span class="f16 c4">m</span><span class="f16 c4"> </span><span class="f16 c4">d</span><span class="f16 c4">o</span><span class="f16 c4">l</span><span class="f16 c4">o</span><span class="f16 c4">r</span><span class="f16 c4"> </span><span class="f16 c4">s</span><span class="f16 c4">i</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">m</span><span class="f13 c3">e</span><span class="f13 c3">t</span><span class="f13 c3">,</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">o</span><span class="f13 c3">n</span><span class="f13 c3">s</span><span class="f13 c3">e</span><span class="f13 c3">c</span><span class="f13 c3">t</span><span class="f13 c3">e</span><span class="f13 c3">t</span><span class="f13 c3">u</span><span class="f13 c3">r</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">d</span><span class="f13 c3">i</span><span class="f13 c3">p</span><span class="f13 c3">i</span><span class="f13 c3">s</span><span class="f13 c3">i</span><span class="f13 c3">c</span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3">g</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">l</span><span class="f13 c3">i</span><span class="f13 c3">t</span><span class="f13 c3">,</span><span class="f13 c3"> </span><span class="f13 c3">s</span><span class="f13 c3">e</span><span class="f13 c3">d</span><span class="f13 c3"> </span><span class="f13 c3">d</span><span class="f13 c3">o</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">i</span><span class="f13 c3">u</span><span class="f13 c3">s</span><span class="f13 c3">m</span><span class="f13 c3">o</span><span class="f13 c3">d</span><span class="f13 c3"> </span><span class="f13 c3">t</span><span class="f13 c3">e</span><span class="f13 c3">m</span><span class="f13 c3">p</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3">c</span><span class="f13 c3">i</span><span class="f13 c3">d</span><span class="f13 c3">i</span><span class="f13 c3">d</span><span class="f13 c3">u</span><span class="f13 c3">n</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">u</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">l</span><span class="f13 c3">a</span><span class="f13 c3">b</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">d</span><span class="f13 c3">o</span><span class="f13 c3">l</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">m</span><span class="f13 c3">a</span><span class="f13 c3">g</span><span class="f13 c3">n</span><span class="f13 c3">a</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">l</span><span class="f13 c3">i</span><span class="f13 c3">q</span><span class="f13 c3">u</span><span class="f13 c3">a</span><span class="f13 c3">.</span><span class="f13 c3"> </span><span class="f13 c3">U</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">n</span><span class="f13 c3">i</span><span class="f13 c3">m</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">d</span><span class="f13 c3"> </span><span class="f13 c3">m</span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3">i</span><span class="f13 c3">m</span><span class="f13 c3"> </span><span class="f13 c3">v</span><span class="f13 c3">e</span><span class="f13 c3">n</span><span class="f13 c3">i</span><span class="f13 c3">a</span><span class="f13 c3">m</span><span class="f13 c3">,</span><span class="f13 c3"> </span><span class="f13 c3">q</span><span class="f13 c3">u</span><span class="f13 c3">i</span><span class="f13 c3">s</span><span class="f13 c3"> </span><span class="f13 c3">n</span><span class="f13 c3">o</span><span class="f13 c3">s</span><span class="f13 c3">t</span><span class="f13 c3">r</span><span class="f13 c3">u</span><span class="f13 c3">d</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">x</span><span class="f13 c3">e</span><span class="f13 c3">r</span><span class="f13 c3">c</span><span class="f13 c3">i</span><span class="f13 c3">t</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3">i</span><span class="f13 c3">o</span><span class="f13 c3">n</span><span class="f13 c3"> </span><span class="f13 c3">u</span><span class="f13 c3">l</span><span class="f13 c3">l</span><span class="f13 c3">a</span><span class="f13 c3">m</span><span class="f13 c3">c</span><span class="f13 c3">o</span><span class="f13 c3"> </span><span class="f13 c3">l</span><span class="f13 c3">a</span><span class="f13 c3">b</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3">i</span><span class="f13 c3">s</span><span class="f13 c3"> </span><span class="f13 c3">n</span><span class="f13 c3">i</span><span class="f13 c3">s</span><span class="f13 c3">i</span><span class="f13 c3"> </span><span class="f13 c3">u</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">l</span><span class="f13 c3">i</span><span class="f13 c3">q</span><span class="f13 c3">u</span><span class="f13 c3">i</span><span class="f13 c3">p</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">x</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">a</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">o</span><span class="f13 c3">m</span><span class="f13 c3">m</span><span class="f13 c3">o</span><span class="f13 c3">d</span><span class="f13 c3">o</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">o</span><span class="f13 c3">n</span><span class="f13 c3">s</span><span class="f13 c3">e</span><span class="f13 c3">q</span><span class="f13 c3">u</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3">.</span><span class="f13 c3"> </span><span class="f13 c3">D</span><span class="f13 c3">u</span><span class="f13 c3">i</span><span class="f13 c3">s</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">u</span><span class="f13 c3">t</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">r</span><span class="f13 c3">u</span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">d</span><span class="f13 c3">o</span><span class="f13 c3">l</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3"> </span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3">p</span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3">h</span><span class="f13 c3">e</span><span class="f13 c3">n</span><span class="f13 c3">d</span><span class="f13 c3">e</span><span class="f13 c3">r</span><span class="f13 c3">i</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3"> </span><span class="f13 c3">v</span><span class="f13 c3">o</span><span class="f13 c3">l</span><span class="f13 c3">u</span><span class="f13 c3">p</span><span class="f13 c3">t</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">v</span><span class="f13 c3">e</span><span class="f13 c3">l</span><span class="f13 c3">i</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">s</span><span class="f13 c3">s</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">i</span><span class="f13 c3">l</span><span class="f13 c3">l</span><span class="f13 c3">u</span><span class="f13 c3">m</span><span class="f13 c3"> </span><span class="f13 c3">d</span><span class="f13 c3">o</span><span class="f13 c3">l</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">u</span><span class="f13 c3"> </span><span class="f13 c3">f</span><span class="f13 c3">u</span><span class="f13 c3">g</span><span class="f13 c3">i</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">n</span><span class="f13 c3">u</span><span class="f13 c3">l</span><span class="f13 c3">l</span><span class="f13 c3">a</span><span class="f13 c3"> </span><span class="f13 c3">p</span><span class="f13 c3">a</span><span class="f13 c3">r</span><span class="f13 c3">i</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3">u</span><span class="f13 c3">r</span><span class="f13 c3">.</span><span class="f13 c3"> </span><span class="f13 c3">E</span><span class="f13 c3">x</span><span class="f13 c3">c</span><span class="f13 c3">e</span><span class="f13 c3">p</span><span class="f13 c3">t</span><span class="f13 c3">e</span><span class="f13 c3">u</span><span class="f13 c3">r</span><span class="f13 c3"> </span><span class="f13 c3">s</span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">o</span><span class="f13 c3">c</span><span class="f13 c3">c</span><span class="f13 c3">a</span><span class="f13 c3">e</span><span class="f13 c3">c</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">u</span><span class="f13 c3">p</span><span class="f13 c3">i</span><span class="f13 c3">d</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">n</span><span class="f13 c3">o</span><span class="f13 c3">n</span><span class="f13 c3"> </span><span class="f13 c3">p</span><span class="f13 c3">r</span><span class="f13 c3">o</span><span class="f13 c3">i</span><span class="f13 c3">d</span><span class="f13 c3">e</span><span class="f13 c3">n</span><span class="f13 c3">t</span><span class="f13 c3">,</span><span class="f13 c3"> </span><span class="f13 c3">s</span><span class="f13 c3">u</span><span class="f13 c3">n</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">u</span><span class="f13 c3">l</span><span class="f13 c3">p</span><span class="f13 c3">a</span><span class="f13 c3"> </span><span class="f13 c3">q</span><span class="f13 c3">u</span><span class="f13 c3">i</span><span class="f13 c3"> </span><span class="f13 c3">o</span><span class="f13 c3">f</span><span class="f13 c3">f</span><span class="f13 c3">i</span><span class="f13 c3">c</span><span class="f13 c3">i</span><span class="f13 c3">a</span><span class="f13 c3"> </span><span class="f13 c3">d</span><span class="f13 c3">e</span><span class="f13 c3">s</span><span class="f13 c3">e</span><span class="f13 c3">r</span><span class="f13 c3">u</span><span class="f13 c3">n</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">m</span><span class="f13 c3">o</span><span class="f13 c3">l</span><span class="f13 c3">l</span><span class="f13 c3">i</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">n</span><span class="f13 c3">i</span><span class="f13 c3">m</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">d</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">s</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">l</span><span class="f13 c3">a</span><span class="f13 c3">b</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3">u</span><span class="f13 c3">m</span><span class="f13 c3">.</span>'

// preview mode

// var grey_text = $('span class="f16 c12"').text('lorem ipsum')

var preview_mode = function(){
  $('#page, .box, .header, .body, .divider, .triangle').addClass('preview')
  $('.header').hide()
  $('.triangle').hide()
  $('.content').attr('content-editable', 'false')
}

var edit_mode = function(){
  $('#page, .box, .header, .body, .divider, .triangle').removeClass('preview')
  $('.header').show()
  $('.triangle').show()
  $('.content').attr('content-editable', 'true')
}

console.log('hello world')