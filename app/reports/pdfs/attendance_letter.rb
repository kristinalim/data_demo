module Pdfs
  class AttendanceLetter < Base
    attr_accessor :attendance_summary, :attendance

    def initialize(attendance_summary, attendance, pdf_options)
      self.attendance_summary = attendance_summary
      self.attendance = attendance
      self.attendances = [attendance]

      super(pdf_options)
    end
  end
end
