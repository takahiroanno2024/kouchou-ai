'use client'

import {Chart} from '@/components/report/Chart'
import React, {useState} from 'react'
import {Cluster, Result} from '@/type'
import {SelectChartButton} from '@/components/charts/SelectChartButton'
import {DensityFilterSettingDialog} from '@/components/report/DensityFilterSettingDialog'

type Props = {
  result: Result
}

export function ClientContainer({result}: Props) {
  const [filteredResult, setFilteredResult] = useState<Result>(result)
  const [openDensityFilterSetting, setOpenDensityFilterSetting] = useState(false)
  const [selectedChart, setSelectedChart] = useState('scatterAll')
  const [maxDensity, setMaxDensity] = useState(0.2)
  const [minValue, setMinValue] = useState(5)
  const [isFullscreen, setIsFullscreen] = useState(false)


  function updateFilteredResult(maxDensity: number, minValue: number) {
    if (!result) return
    setFilteredResult({
      ...result,
      clusters: getDenseClusters(
        result.clusters || [],
        maxDensity,
        minValue
      )
    })
  }

  function onChangeDensityFilter(maxDensity: number, minValue: number) {
    setMaxDensity(maxDensity)
    setMinValue(minValue)
    if (selectedChart === 'scatterDensity') {
      updateFilteredResult(maxDensity, minValue)
    }
  }

  return (
    <>
      {openDensityFilterSetting && (
        <DensityFilterSettingDialog
          currentMaxDensity={maxDensity}
          currentMinValue={minValue}
          onClose={() => {
            setOpenDensityFilterSetting(false)
          }}
          onChangeFilter={onChangeDensityFilter}
        />
      )}
      <SelectChartButton
        selected={selectedChart}
        onChange={(selectedChart) => {
          setSelectedChart(selectedChart)
          if (selectedChart === 'scatterAll' || selectedChart === 'treemap') {
            updateFilteredResult(1, 0)
          }
          if (selectedChart === 'scatterDensity') {
            updateFilteredResult(maxDensity, minValue)
          }
        }}
        onClickDensitySetting={() => {
          setOpenDensityFilterSetting(true)
        }}
        onClickFullscreen={() => {
          setIsFullscreen(true)
        }}
      />
      <Chart
        result={filteredResult}
        selectedChart={selectedChart}
        isFullscreen={isFullscreen}
        onExitFullscreen={() => {
          setIsFullscreen(false)
        }}
      />
    </>
  )
}

function getDenseClusters(clusters: Cluster[], maxDensity: number, minValue: number): Cluster[] {
  const deepestLevel = clusters.reduce((maxLevel, cluster) => Math.max(maxLevel, cluster.level), 0)
  return [
    ...clusters.filter(c => c.level !== deepestLevel),
    ...clusters.filter(c => c.level === deepestLevel).filter(c => c.density_rank_percentile <= maxDensity).filter(c => c.value >= minValue)
  ]
}
