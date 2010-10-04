class CreateBoxes < ActiveRecord::Migration
  def self.up
    create_table :boxes do |t|
      t.integer :page_id
      t.integer :width
      t.integer :min_height
      t.text :content
      t.timestamps
    end
  end

  def self.down
    drop_table :boxes
  end
end
