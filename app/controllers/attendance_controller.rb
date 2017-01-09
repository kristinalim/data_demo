class AttendanceController < ApplicationController

  def index
    @data = ''
    @data += File.read('lib/assets/data/fake_students.csv')
    gon.attendanceFilter = @data
  end

  def letter
    # TODO: Load actual data.
    csv_string = File.read('lib/assets/data/fake_students.csv')
    @attendance_summary = AttendanceSummary.new({csv_string: csv_string})
    @attendance = @attendance_summary.find(params[:id].to_s)

    respond_to do |format|
      format.pdf { send_pdf(Pdfs::AttendanceLetter.new(@attendance_summary, @attendance, context: self), "AttendanceLetter.pdf") }
    end
  end
end
