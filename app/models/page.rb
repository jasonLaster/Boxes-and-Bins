class Page < ActiveRecord::Base

  belongs_to :user
  has_many :boxs
  has_many :containers
  
  
  def get_version
    self.boxs.first.version
  end

  def self.create_uid
    input = (48..57).to_a + (65..90).to_a + (97..120).to_a
    indeces = (input.length.to_a * 7).map {|i| rand(i)}
    return indeces.map {|j| input[j].chr}.join()
  end


  def copy_content
    
    def copy_objs (objects)
      objects.each do |o| 
        obj = o.clone
        obj.page_id = self.id
        obj.version = 1
        obj.save
      end
    end

    temp_page = Page.find_by_uid('default') # 0 is probably a bad id
    self.root = temp_page.root
    self.save
    copy_objs(temp_page.boxs)
    copy_objs(temp_page.containers)
  end
    


end
