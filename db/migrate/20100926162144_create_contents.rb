class CreateContents < ActiveRecord::Migration
  def self.up
    create_table :contents do |t|
      t.integer :page_id
      t.string :content 
      t.integer :a_child
      t.integer :b_child
      t.integer :color
      t.integer :width
      t.integer :root
      t.string :label
      t.string :body
      t.timestamps
    end
  end

  def self.down
    drop_table :contents
  end
end
