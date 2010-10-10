class RenameUid < ActiveRecord::Migration
  def self.up
    rename_column :pages, :unique_id, :uid
  end

  def self.down
    rename_column :pages, :uid, :unique_id
  end
end
