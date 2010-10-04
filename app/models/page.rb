class Page < ActiveRecord::Base

  belongs_to :user
  has_many :boxs
  has_many :containers
  
  def load
    boxes = self.boxs
    boxes.map! {|i| {:id => i.b_id, :width => i.width, :min_height => i.min_height, :content => i.content}}
    boxes_h = Hash.new
    boxes.each {|i| boxes_h[i[:id]] = i}

    containers = self.containers
    containers.map! {|i| {:id => i.c_id, :type => i.c_type, :position => i.c_position, :a_child => i.a_child, :b_child => i.b_child}} 
    containers_h = Hash.new
    containers.each {|i| containers_h[i[:id]] = i}
    
    root = self.root
    
    {:box => boxes_h, :container => containers_h, :root => root}
  end

end
