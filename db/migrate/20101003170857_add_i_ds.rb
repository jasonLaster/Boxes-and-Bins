class AddIDs < ActiveRecord::Migration
  def self.up
    add_column :boxes, :b_id, :integer
    add_column :containers, :c_id, :integer
    
  end

  def self.down
    remove_column :boxes, :b_id
    remove_column :containers, :c_id
  end
end