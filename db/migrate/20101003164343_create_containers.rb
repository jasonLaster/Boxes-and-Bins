class CreateContainers < ActiveRecord::Migration
  def self.up
    create_table :containers do |t|
      t.integer :page_id
      t.string :type
      t.character :position
      t.integer :a_child
      t.integer :b_child 
      t.timestamps
    end
  end

  def self.down
    drop_table :containers
  end
end
