class DropContents < ActiveRecord::Migration
  def self.up
    drop_table :contents
  end

  def self.down
  end
end
