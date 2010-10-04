
var elements = {};
elements.container = {};
elements.box = {};

elements.container[1] = {'id': 1, 'type': 'horizontal', 'position':'a', 'a_child':2, 'b_child':3};
  elements.container[2] = {'id': 2, 'type': 'simple', 'position':'a', 'a_child':1, 'b_child':''};

  elements.container[3] = {'id': 3, 'type': 'horizontal', 'position':'b', 'a_child':4, 'b_child':6};
    elements.container[4] = {'id': 4, 'type': 'simple',   'position':'a', 'a_child':2, 'b_child':''};
    elements.container[6] = {'id': 6, 'type': 'vertical', 'position':'b', 'a_child':5, 'b_child':7};
      elements.container[5] = {'id': 5, 'type': 'simple', 'position':'a', 'a_child':3, 'b_child':''};
      elements.container[7] = {'id': 7, 'type': 'simple', 'position':'b', 'a_child':4, 'b_child':''};

elements.box[1]  = {'id':1, 'type':'text', 'width':490, 'min_height':200, 'content':'Boxes & Bins' };
elements.box[2]  = {'id':2, 'type':'text', 'width':235, 'min_height':200, 'content':'a child' };
elements.box[3]  = {'id':3, 'type':'text', 'width':235, 'min_height':200, 'content':'b child' };
elements.box[4]  = {'id':4, 'type':'text', 'width':235, 'min_height':200, 'content':'b.1 child' };


var blue_span = $('<span>').html('Boxes & Bins').css('color', '#253e5f').css('font-size', 16);
var grey_span = $('<span>').html('MS Word 2.0').css('color', '#444').css('font-size', 14);
var ln_break = $('<br />');
var c = $('<span>').append(blue_span).append(ln_break).append(grey_span)

var elements = {};
elements.container = {};
elements.box = {};
elements.container[1] = {'id': 1, 'type': 'simple',   'position':'a', 'a_child':1, 'b_child':''};
elements.box[1]  = {'id':1, 'type':'text', 'width':1000, 'min_height':200, 'content':c };
elements = {"container":{"1":{"id":1