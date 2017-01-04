class AttendanceController < ApplicationController

  def index
    @data = ''
    @data += File.read('lib/assets/data/fake_students.csv')
    gon.attendanceFilter = @data
  end


end
