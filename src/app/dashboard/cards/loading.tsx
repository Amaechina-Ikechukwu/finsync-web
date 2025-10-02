import ActivityFeed from '@/components/ActivityFeed'
import Loader from '@/components/Loader'
import React from 'react'

function LoadingPage() {
  return (
    <div className="h-48 flex items-center justify-center">
       <Loader /> 
    </div>
  )
}

export default LoadingPage