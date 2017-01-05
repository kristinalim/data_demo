class AttendanceController < ApplicationController

  def index
    @data = ''
    @data += File.read('lib/assets/data/fake_students.csv')
    gon.attendanceFilter = @data
  end

  def letter
    # TODO: Load the attendance record.
    @attendance = nil

    respond_to do |format|
      format.pdf { send_pdf(Pdfs::AttendanceLetter.new(@attendance, context: self), "AttendanceLetter.pdf") }
    end
  end
end
