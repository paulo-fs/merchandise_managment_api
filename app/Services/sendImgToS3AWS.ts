import Application from '@ioc:Adonis/Core/Application'
import Drive from '@ioc:Adonis/Core/Drive'

interface IUser {
  name: string
  cpf: string
}

export async function sendImgToS3AWS(file: any, user: IUser): Promise<string> {
  const s3 = await Drive.use('s3')

  const ContentType = `${file.type || 'image'}/${file.extname || 'jpg'}`
  const ACL = 'public-read'
  const KEY = `images_profiles/profile_pic_${user.name.replace(/\s/g, '')}_${user.cpf}.jpg`

  await file.move(Application.tmpPath('uploads'))

  const stream = await Drive.getStream(`${file.clientName}`)

  try {
    await s3.putStream(KEY, stream, { ContentType, ACL })
  } catch (error) {
    throw new Error(`Error in upload for S3 AWS! ${error.message}`)
  }

  try {
    await Drive.delete(`${file.clientName}`)
  } catch (error) {
    throw new Error(`Error in remove tmp directory! ${error.message}`)
  }

  try {
    let url = await s3.getSignedUrl(KEY)
    return url.split('?')[0]
  } catch (error) {
    console.log('esse do erro', error)
    throw new Error('Error in get file from url by S3 AWS')
  }
}
