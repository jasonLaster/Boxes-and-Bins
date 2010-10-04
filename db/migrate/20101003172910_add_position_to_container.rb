class AddPositionToContainer < ActiveRecord::Migration
  def self.up
    add_column :containers, :c_position, :character
  end

  def self.down
    remove_column :containers, :c_position
  end
end
