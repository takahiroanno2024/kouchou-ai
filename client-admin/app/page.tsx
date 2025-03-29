'use client'

import {Header} from '@/components/Header'
import {Report} from '@/type'
import {Box, Button, Card, Heading, HStack, Spinner, Text, VStack, Icon} from '@chakra-ui/react'
import Link from 'next/link'
import {CircleCheckIcon, CircleFadingArrowUpIcon, CircleAlertIcon, EllipsisIcon, ExternalLinkIcon, DownloadIcon} from 'lucide-react'
import {MenuContent, MenuItem, MenuRoot, MenuTrigger} from '@/components/ui/menu'
import {Tooltip} from '@/components/ui/tooltip'
import {getApiBaseUrl} from '@/app/utils/api'
import {useEffect, useState} from 'react'

export default function Page() {
  const [reports, setReports] = useState<Report[]>()

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'ready':
        return {
          borderColor: 'green',
          iconColor: 'green',
          textColor: '#2577b1',
          icon: <CircleCheckIcon size={30}/>
        }
      case 'error':
        return {
          borderColor: 'red.600',
          iconColor: 'red.600',
          textColor: 'red.600',
          icon: <CircleAlertIcon size={30}/>
        }
      default:
        return {
          borderColor: 'gray',
          iconColor: 'gray',
          textColor: 'gray',
          icon: <CircleFadingArrowUpIcon size={30}/>
        }
    }
  }

  useEffect(() => {
    (async () => {
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/admin/reports', {
        method: 'GET',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
          'Content-Type': 'application/json'
        },
      })
      if (!response.ok) return
      setReports(await response.json())
    })()
  }, [])

  return (
    <div className={'container'}>
      <Header/>
      <Box mx={'auto'} maxW={'1000px'} mb={5}>
        <Heading textAlign={'center'} fontSize={'xl'} mb={5}>Admin Dashboard</Heading>
        <Heading textAlign={'center'} fontSize={'xl'} mb={5}>Reports</Heading>
        {!reports && (
          <VStack>
            <Spinner/>
          </VStack>
        )}
        {reports && reports.length === 0 && (
          <VStack my={10}>
            <Text>レポートがありません</Text>
          </VStack>
        )}
        {reports && reports.map(report => {
          const statusDisplay = getStatusDisplay(report.status)

          return (
            <Card.Root
              size="md"
              key={report.slug}
              mb={4}
              borderLeftWidth={10}
              borderLeftColor={statusDisplay.borderColor}
            >
              <Card.Body>
                <HStack justify={'space-between'}>
                  <HStack>
                    <Box mr={3} color={statusDisplay.iconColor}>
                      {statusDisplay.icon}
                    </Box>
                    <Box>
                      <Card.Title>
                        <Text
                          fontSize={'md'}
                          color={statusDisplay.textColor}
                        >{report.title}</Text>
                      </Card.Title>
                      <Card.Description>
                        {`${process.env.NEXT_PUBLIC_CLIENT_BASEPATH}/${report.slug}`}
                      </Card.Description>
                    </Box>
                  </HStack>
                  <HStack>

                    {report.status === 'ready' && report.isPubcom && (
                      <Tooltip content={'CSVファイルをダウンロード'} openDelay={0} closeDelay={0}>
                        <Button
                          variant={'ghost'}
                          onClick={async () => {
                            try {
                              const response = await fetch(getApiBaseUrl() + `/get-csv/${report.slug}`, {
                                headers: {
                                  'x-api-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
                                  'Content-Type': 'application/json'
                                }
                              })
                              if (!response.ok) {
                                throw new Error('CSVダウンロード失敗')
                              }
                              const blob = await response.blob()
                              const url = window.URL.createObjectURL(blob)
                              const link = document.createElement('a')
                              link.href = url
                              link.download = `kouchou_${report.slug}.csv`
                              link.click()
                              window.URL.revokeObjectURL(url)
                            } catch (error) {
                              console.error(error)
                              alert('CSVのダウンロードに失敗しました')
                            }
                          }}
                        >
                          <Icon><DownloadIcon/></Icon>
                        </Button>
                      </Tooltip>
                    )}



                    {report.status === 'ready' && (
                      <Link href={`${process.env.NEXT_PUBLIC_CLIENT_BASEPATH}/${report.slug}`} target={'_blank'}>
                        <Button variant={'ghost'}>
                          <ExternalLinkIcon/>
                        </Button>
                      </Link>
                    )}
                    <MenuRoot>
                      <MenuTrigger asChild>
                        <Button variant="ghost" size="lg">
                          <EllipsisIcon/>
                        </Button>
                      </MenuTrigger>
                      <MenuContent>
                        <MenuItem value={'duplicate'}>
                          レポートを複製して新規作成(開発中)
                        </MenuItem>
                        <MenuItem
                          value="delete"
                          color="fg.error"
                        >
                          レポートを削除する(開発中)
                        </MenuItem>
                      </MenuContent>
                    </MenuRoot>
                  </HStack>
                </HStack>
              </Card.Body>
            </Card.Root>
          )
        })}
        <HStack justify={'center'} mt={10}>
          <Link href={'/create'}>
            <Button size={'xl'}>新しいレポートを作成する</Button>
          </Link>
        </HStack>
      </Box>
    </div>
  )
}
