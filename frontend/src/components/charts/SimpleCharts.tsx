import React from "react"

interface ChartData {
  name: string
  value: number
  color?: string
}

interface SimpleBarChartProps {
  data: ChartData[]
  height?: number
  className?: string
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  data, 
  height = 200, 
  className = "" 
}) => {
  const maxValue = Math.max(...data.map(item => item.value))
  
  return (
    <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
      <div className="flex items-end justify-between h-full gap-2 pt-4">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 40) // 40px for labels
          const color = item.color || '#3b82f6' // Default to bright blue
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 gap-2">
              <div 
                className="w-full rounded-t-sm transition-all duration-700 hover:opacity-80"
                style={{ 
                  height: `${barHeight}px`,
                  backgroundColor: color,
                  opacity: 0.9
                }}
                title={`${item.name}: ${item.value.toLocaleString()}`}
              />
              <div className="text-xs text-muted-foreground text-center">
                {item.name}
              </div>
              <div className="text-xs font-medium text-center">
                {item.value.toLocaleString()}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface SimpleLineChartProps {
  data: ChartData[]
  height?: number
  className?: string
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ 
  data, 
  height = 200, 
  className = "" 
}) => {
  const maxValue = Math.max(...data.map(item => item.value))
  const minValue = Math.min(...data.map(item => item.value))
  const range = maxValue - minValue
  
  // Calculate points for the line
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = range === 0 ? 50 : ((maxValue - item.value) / range) * 80 + 10
    return { x, y, value: item.value, name: item.name }
  })
  
  // Create path string for SVG
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L'
    return `${path} ${command} ${point.x} ${point.y}`
  }, '')
  
  return (
    <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
      <div className="relative w-full h-full">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.2"
                className="text-muted-foreground"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Area under the line */}
          <path
            d={`${pathData} L 100 90 L 0 90 Z`}
            fill="#3b82f6"
            fillOpacity="0.15"
            className="dark:fill-blue-400"
          />
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="dark:stroke-blue-400"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#3b82f6"
              stroke="hsl(var(--background))"
              strokeWidth="1"
              className="hover:r-5 transition-all cursor-pointer dark:fill-blue-400"
            >
              <title>{`${point.name}: ${point.value.toLocaleString()}`}</title>
            </circle>
          ))}
        </svg>
        
        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
          {data.map((item, index) => (
            <div key={index} className="text-xs text-muted-foreground text-center">
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface DonutChartProps {
  data: ChartData[]
  size?: number
  className?: string
}

export const SimpleDonutChart: React.FC<DonutChartProps> = ({ 
  data, 
  size = 200, 
  className = "" 
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const radius = 40
  const circumference = 2 * Math.PI * radius
  
  let accumulatedPercentage = 0
  
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div style={{ width: size, height: size }} className="relative">
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="transform -rotate-90"
        >
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
            const strokeDashoffset = -accumulatedPercentage * circumference / 100
            
            // Use bright, visible colors for both light and dark mode
            const brightColors = [
              '#3b82f6', // Blue
              '#10b981', // Green  
              '#f59e0b', // Amber
              '#ef4444', // Red
              '#8b5cf6'  // Purple
            ]
            const color = item.color || brightColors[index % brightColors.length]
            
            accumulatedPercentage += percentage
            
            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1)
          
          // Use same bright colors as the chart
          const brightColors = [
            '#3b82f6', // Blue
            '#10b981', // Green  
            '#f59e0b', // Amber
            '#ef4444', // Red
            '#8b5cf6'  // Purple
          ]
          const color = item.color || brightColors[index % brightColors.length]
          
          return (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div className="text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground ml-1">
                  ({percentage}%)
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}