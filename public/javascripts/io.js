
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
var e1 = {"container":{"1":{"id":1,"type":"simple","position":"a","a_child":1,"b_child":""},"3":{"id":3,"type":"simple","position":"a","a_child":3,"b_child":""},"4":{"id":4,"type":"horizontal","position":"a","a_child":10,"b_child":7},"6":{"id":6,"type":"simple","position":"a","a_child":5,"b_child":""},"7":{"id":7,"type":"horizontal","position":"b","a_child":13,"b_child":16},"9":{"id":9,"type":"simple","position":"b","a_child":7,"b_child":""},"10":{"id":10,"type":"vertical","position":"a","a_child":1,"b_child":9},"12":{"id":12,"type":"simple","position":"b","a_child":9,"b_child":""},"13":{"id":13,"type":"vertical","position":"a","a_child":3,"b_child":12},"15":{"id":15,"type":"simple","position":"b","a_child":11,"b_child":""},"16":{"id":16,"type":"vertical","position":"b","a_child":6,"b_child":15}},"box":{"1":{"width":490,"id":1,"min_height":200,"content":"<span><span style=\"color: rgb(37, 62, 95); font-size: 16px; \">Boxes &amp; Bins</span><br><span style=\"color: rgb(68, 68, 68); font-size: 14px; \">MS Word 2.0</span></span>"},"3":{"width":235,"id":3,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\">How do I create new boxes?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span></span></font><div><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \">Hover over the box's header and click on an arrow.</span></span></font></div>"},"5":{"width":235,"id":5,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\">How do I remove a box?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span></span></font><div><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \">Hover over the box's header and click on the circle.</span></span></font></div>"},"7":{"width":490,"id":7,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\"><br></font>"},"9":{"width":235,"id":9,"min_height":320,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\">Why Boxes &amp; Bins?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">Boxes &amp; Bins is a contextual text-editor, which means that drafting documents in BB is one part content and one part context.&nbsp;</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">In other words, if you're not moving boxes around the page, you're doing it wrong.</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">I hope to build Boxes &amp; Bins into a full-fledged publishing environment.</span></font></div>"},"11":{"width":235,"id":11,"min_height":319,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\"><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(95, 26, 8); font-size: medium; \">Give us feedback!</span></span></font></font><div><font class=\"Apple-style-span\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\"><br></font></font><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \">Boxes &amp; Bins begun as a small side-project last weekend. If you're playing around with BB we'd love to hear from you!</span></div></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \"><br></span></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\"><a class=\"Apple-style-span\" style=\"font-size: 14px;\" href=\"https://spreadsheets.google.com/viewform?formkey=dGJycFlwRjR4TVRnYlN5dHh4SDg1T2c6MQ\">Feedback!</a></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \"><br></span></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-family: Helvetica; \"><div style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font></div></div>"}},"root_id":""}
var e2 = {"box":{"1":{"width":1000,"content":"","min_height":200,"id":1}},"container":{"1":{"type":"simple","b_child":null,"a_child":1,"position":"a","id":1}},"root":1}
var e3 = {"container":{"1":{"id":1,"type":"simple","position":"a","a_child":1,"b_child":""},"3":{"id":3,"type":"simple","position":"a","a_child":3,"b_child":""},"4":{"id":4,"type":"horizontal","position":"a","a_child":10,"b_child":7},"6":{"id":6,"type":"simple","position":"a","a_child":5,"b_child":""},"7":{"id":7,"type":"horizontal","position":"b","a_child":13,"b_child":16},"9":{"id":9,"type":"simple","position":"b","a_child":7,"b_child":""},"10":{"id":10,"type":"vertical","position":"a","a_child":1,"b_child":9},"12":{"id":12,"type":"simple","position":"b","a_child":9,"b_child":""},"13":{"id":13,"type":"vertical","position":"a","a_child":3,"b_child":12},"15":{"id":15,"type":"simple","position":"b","a_child":11,"b_child":""},"16":{"id":16,"type":"vertical","position":"b","a_child":6,"b_child":15}},"box":{"1":{"width":490,"id":1,"min_height":200,"content":"<span><span style=\"color: rgb(37, 62, 95); font-size: 16px; \">Boxes &amp; Bins</span><br><span style=\"color: rgb(68, 68, 68); font-size: 14px; \">MS Word 2.0</span></span>"},"3":{"width":235,"id":3,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\">How do I create new boxes?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span></span></font><div><font class=\"Apple-style-span\" color=\"#253E5F\" size=\"3\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \">Hover over the box's header and click on an arrow.</span></span></font></div>"},"5":{"width":235,"id":5,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\">How do I remove a box?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span></span></font><div><font class=\"Apple-style-span\" size=\"3\" color=\"#253E5F\"><span class=\"Apple-style-span\" style=\"color: rgb(0, 0, 0); font-size: 12px; \"><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \">Hover over the box's header and click on the circle.</span></span></font></div>"},"7":{"width":490,"id":7,"min_height":0,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\"><br></font>"},"9":{"width":235,"id":9,"min_height":320,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\">Why Boxes &amp; Bins?<br></font><span style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; color: rgb(68, 68, 68); font-size: 14px; \"><br></span><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">Boxes &amp; Bins is a contextual text-editor, which means that drafting documents in BB is one part content and one part context.&nbsp;</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">In other words, if you're not moving boxes around the page, you're doing it wrong.</span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><br></span></font></div><div><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\">I hope to build Boxes &amp; Bins into a full-fledged publishing environment.</span></font></div>"},"11":{"width":235,"id":11,"min_height":319,"content":"<meta charset=\"utf-8\"><font class=\"Apple-style-span\"><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"font-size: 14px;\"><meta charset=\"utf-8\"><span class=\"Apple-style-span\" style=\"color: rgb(95, 26, 8); font-size: medium; \">Give us feedback!</span></span></font></font><div><font class=\"Apple-style-span\"><font class=\"Apple-style-span\" color=\"#5F1A08\" size=\"3\"><br></font></font><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \">Boxes &amp; Bins begun as a small side-project last weekend. If you're playing around with BB we'd love to hear from you!</span></div></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \"><br></span></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; \"><font class=\"Apple-style-span\" color=\"#444444\"><a class=\"Apple-style-span\" style=\"font-size: 14px;\" href=\"https://spreadsheets.google.com/viewform?formkey=dGJycFlwRjR4TVRnYlN5dHh4SDg1T2c6MQ\">Feedback!</a></font></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 12px; font-family: Helvetica; border-width: initial; border-color: initial; color: rgb(0, 0, 0); \"><span class=\"Apple-style-span\" style=\"font-size: 14px; color: rgb(68, 68, 68); \"><br></span></div><div style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; border-width: initial; border-color: initial; font-family: Helvetica; \"><div style=\"color: rgb(0, 0, 0); font-size: 12px; \"><font class=\"Apple-style-span\" color=\"#444444\"><span class=\"Apple-style-span\" style=\"margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; border-top-style: none; border-right-style: none; border-bottom-style: none; border-left-style: none; border-width: initial; border-color: initial; font-size: 14px; \"><br></span></font></div></div>"}},"root_id":""}

var text = '<span class="f16 c4">L</span><span class="f16 c4">o</span><span class="f16 c4">r</span><span class="f16 c4">e</span><span class="f16 c4">m</span><span class="f16 c4"> </span><span class="f16 c4">i</span><span class="f16 c4">p</span><span class="f16 c4">s</span><span class="f16 c4">u</span><span class="f16 c4">m</span><span class="f16 c4"> </span><span class="f16 c4">d</span><span class="f16 c4">o</span><span class="f16 c4">l</span><span class="f16 c4">o</span><span class="f16 c4">r</span><span class="f16 c4"> </span><span class="f16 c4">s</span><span class="f16 c4">i</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">m</span><span class="f13 c3">e</span><span class="f13 c3">t</span><span class="f13 c3">,</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">o</span><span class="f13 c3">n</span><span class="f13 c3">s</span><span class="f13 c3">e</span><span class="f13 c3">c</span><span class="f13 c3">t</span><span class="f13 c3">e</span><span class="f13 c3">t</span><span class="f13 c3">u</span><span class="f13 c3">r</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">d</span><span class="f13 c3">i</span><span class="f13 c3">p</span><span class="f13 c3">i</span><span class="f13 c3">s</span><span class="f13 c3">i</span><span class="f13 c3">c</span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3">g</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">l</span><span class="f13 c3">i</span><span class="f13 c3">t</span><span class="f13 c3">,</span><span class="f13 c3"> </span><span class="f13 c3">s</span><span class="f13 c3">e</span><span class="f13 c3">d</span><span class="f13 c3"> </span><span class="f13 c3">d</span><span class="f13 c3">o</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">i</span><span class="f13 c3">u</span><span class="f13 c3">s</span><span class="f13 c3">m</span><span class="f13 c3">o</span><span class="f13 c3">d</span><span class="f13 c3"> </span><span class="f13 c3">t</span><span class="f13 c3">e</span><span class="f13 c3">m</span><span class="f13 c3">p</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3">c</span><span class="f13 c3">i</span><span class="f13 c3">d</span><span class="f13 c3">i</span><span class="f13 c3">d</span><span class="f13 c3">u</span><span class="f13 c3">n</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">u</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">l</span><span class="f13 c3">a</span><span class="f13 c3">b</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">d</span><span class="f13 c3">o</span><span class="f13 c3">l</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">m</span><span class="f13 c3">a</span><span class="f13 c3">g</span><span class="f13 c3">n</span><span class="f13 c3">a</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">l</span><span class="f13 c3">i</span><span class="f13 c3">q</span><span class="f13 c3">u</span><span class="f13 c3">a</span><span class="f13 c3">.</span><span class="f13 c3"> </span><span class="f13 c3">U</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">n</span><span class="f13 c3">i</span><span class="f13 c3">m</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">d</span><span class="f13 c3"> </span><span class="f13 c3">m</span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3">i</span><span class="f13 c3">m</span><span class="f13 c3"> </span><span class="f13 c3">v</span><span class="f13 c3">e</span><span class="f13 c3">n</span><span class="f13 c3">i</span><span class="f13 c3">a</span><span class="f13 c3">m</span><span class="f13 c3">,</span><span class="f13 c3"> </span><span class="f13 c3">q</span><span class="f13 c3">u</span><span class="f13 c3">i</span><span class="f13 c3">s</span><span class="f13 c3"> </span><span class="f13 c3">n</span><span class="f13 c3">o</span><span class="f13 c3">s</span><span class="f13 c3">t</span><span class="f13 c3">r</span><span class="f13 c3">u</span><span class="f13 c3">d</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">x</span><span class="f13 c3">e</span><span class="f13 c3">r</span><span class="f13 c3">c</span><span class="f13 c3">i</span><span class="f13 c3">t</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3">i</span><span class="f13 c3">o</span><span class="f13 c3">n</span><span class="f13 c3"> </span><span class="f13 c3">u</span><span class="f13 c3">l</span><span class="f13 c3">l</span><span class="f13 c3">a</span><span class="f13 c3">m</span><span class="f13 c3">c</span><span class="f13 c3">o</span><span class="f13 c3"> </span><span class="f13 c3">l</span><span class="f13 c3">a</span><span class="f13 c3">b</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3">i</span><span class="f13 c3">s</span><span class="f13 c3"> </span><span class="f13 c3">n</span><span class="f13 c3">i</span><span class="f13 c3">s</span><span class="f13 c3">i</span><span class="f13 c3"> </span><span class="f13 c3">u</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">l</span><span class="f13 c3">i</span><span class="f13 c3">q</span><span class="f13 c3">u</span><span class="f13 c3">i</span><span class="f13 c3">p</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">x</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">a</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">o</span><span class="f13 c3">m</span><span class="f13 c3">m</span><span class="f13 c3">o</span><span class="f13 c3">d</span><span class="f13 c3">o</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">o</span><span class="f13 c3">n</span><span class="f13 c3">s</span><span class="f13 c3">e</span><span class="f13 c3">q</span><span class="f13 c3">u</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3">.</span><span class="f13 c3"> </span><span class="f13 c3">D</span><span class="f13 c3">u</span><span class="f13 c3">i</span><span class="f13 c3">s</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">u</span><span class="f13 c3">t</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">r</span><span class="f13 c3">u</span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">d</span><span class="f13 c3">o</span><span class="f13 c3">l</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3"> </span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3">p</span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3">h</span><span class="f13 c3">e</span><span class="f13 c3">n</span><span class="f13 c3">d</span><span class="f13 c3">e</span><span class="f13 c3">r</span><span class="f13 c3">i</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3"> </span><span class="f13 c3">v</span><span class="f13 c3">o</span><span class="f13 c3">l</span><span class="f13 c3">u</span><span class="f13 c3">p</span><span class="f13 c3">t</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">v</span><span class="f13 c3">e</span><span class="f13 c3">l</span><span class="f13 c3">i</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">s</span><span class="f13 c3">s</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">i</span><span class="f13 c3">l</span><span class="f13 c3">l</span><span class="f13 c3">u</span><span class="f13 c3">m</span><span class="f13 c3"> </span><span class="f13 c3">d</span><span class="f13 c3">o</span><span class="f13 c3">l</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3">e</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">u</span><span class="f13 c3"> </span><span class="f13 c3">f</span><span class="f13 c3">u</span><span class="f13 c3">g</span><span class="f13 c3">i</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">n</span><span class="f13 c3">u</span><span class="f13 c3">l</span><span class="f13 c3">l</span><span class="f13 c3">a</span><span class="f13 c3"> </span><span class="f13 c3">p</span><span class="f13 c3">a</span><span class="f13 c3">r</span><span class="f13 c3">i</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3">u</span><span class="f13 c3">r</span><span class="f13 c3">.</span><span class="f13 c3"> </span><span class="f13 c3">E</span><span class="f13 c3">x</span><span class="f13 c3">c</span><span class="f13 c3">e</span><span class="f13 c3">p</span><span class="f13 c3">t</span><span class="f13 c3">e</span><span class="f13 c3">u</span><span class="f13 c3">r</span><span class="f13 c3"> </span><span class="f13 c3">s</span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">o</span><span class="f13 c3">c</span><span class="f13 c3">c</span><span class="f13 c3">a</span><span class="f13 c3">e</span><span class="f13 c3">c</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">u</span><span class="f13 c3">p</span><span class="f13 c3">i</span><span class="f13 c3">d</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3">a</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">n</span><span class="f13 c3">o</span><span class="f13 c3">n</span><span class="f13 c3"> </span><span class="f13 c3">p</span><span class="f13 c3">r</span><span class="f13 c3">o</span><span class="f13 c3">i</span><span class="f13 c3">d</span><span class="f13 c3">e</span><span class="f13 c3">n</span><span class="f13 c3">t</span><span class="f13 c3">,</span><span class="f13 c3"> </span><span class="f13 c3">s</span><span class="f13 c3">u</span><span class="f13 c3">n</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">n</span><span class="f13 c3"> </span><span class="f13 c3">c</span><span class="f13 c3">u</span><span class="f13 c3">l</span><span class="f13 c3">p</span><span class="f13 c3">a</span><span class="f13 c3"> </span><span class="f13 c3">q</span><span class="f13 c3">u</span><span class="f13 c3">i</span><span class="f13 c3"> </span><span class="f13 c3">o</span><span class="f13 c3">f</span><span class="f13 c3">f</span><span class="f13 c3">i</span><span class="f13 c3">c</span><span class="f13 c3">i</span><span class="f13 c3">a</span><span class="f13 c3"> </span><span class="f13 c3">d</span><span class="f13 c3">e</span><span class="f13 c3">s</span><span class="f13 c3">e</span><span class="f13 c3">r</span><span class="f13 c3">u</span><span class="f13 c3">n</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">m</span><span class="f13 c3">o</span><span class="f13 c3">l</span><span class="f13 c3">l</span><span class="f13 c3">i</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">a</span><span class="f13 c3">n</span><span class="f13 c3">i</span><span class="f13 c3">m</span><span class="f13 c3"> </span><span class="f13 c3">i</span><span class="f13 c3">d</span><span class="f13 c3"> </span><span class="f13 c3">e</span><span class="f13 c3">s</span><span class="f13 c3">t</span><span class="f13 c3"> </span><span class="f13 c3">l</span><span class="f13 c3">a</span><span class="f13 c3">b</span><span class="f13 c3">o</span><span class="f13 c3">r</span><span class="f13 c3">u</span><span class="f13 c3">m</span><span class="f13 c3">.</span>'
