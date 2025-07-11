"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Clock } from "lucide-react"

interface TimePickerProps {
  value: string // 24-hour format like "14:30"
  onChange: (value: string) => void
  placeholder?: string
}

export function TimePicker({ value, onChange, placeholder = "Select time" }: TimePickerProps) {
  const [hour, setHour] = useState("12")
  const [minute, setMinute] = useState("00")
  const [ampm, setAmpm] = useState("AM")
  const [isOpen, setIsOpen] = useState(false)

  // Convert 24-hour time to 12-hour format
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":")
      const hour24 = Number.parseInt(h, 10)
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
      const period = hour24 >= 12 ? "PM" : "AM"

      setHour(hour12.toString())
      setMinute(m)
      setAmpm(period)
    }
  }, [value])

  // Convert 12-hour time to 24-hour format and call onChange
  const updateTime = (newHour: string, newMinute: string, newAmpm: string) => {
    let hour24 = Number.parseInt(newHour, 10)

    if (newAmpm === "AM" && hour24 === 12) {
      hour24 = 0
    } else if (newAmpm === "PM" && hour24 !== 12) {
      hour24 += 12
    }

    const time24 = `${hour24.toString().padStart(2, "0")}:${newMinute}`
    onChange(time24)
  }

  const handleHourChange = (newHour: string) => {
    setHour(newHour)
    updateTime(newHour, minute, ampm)
  }

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute)
    updateTime(hour, newMinute, ampm)
  }

  const handleAmpmChange = (newAmpm: string) => {
    setAmpm(newAmpm)
    updateTime(hour, minute, newAmpm)
  }

  const formatDisplayTime = () => {
    if (!value) return placeholder
    return `${hour}:${minute} ${ampm}`
  }

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString())
  const minutes = ["00", "15", "30", "45"]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal bg-transparent"
          onClick={() => setIsOpen(true)}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatDisplayTime()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="text-sm font-medium text-center">Select Time</div>

          <div className="flex items-center gap-2">
            {/* Hour Selection */}
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Hour</div>
              <Select value={hour} onValueChange={handleHourChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-lg font-bold pt-4">:</div>

            {/* Minute Selection */}
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Minute</div>
              <Select value={minute} onValueChange={handleMinuteChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AM/PM Selection */}
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Period</div>
              <Select value={ampm} onValueChange={handleAmpmChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={() => setIsOpen(false)} className="w-full" size="sm">
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
