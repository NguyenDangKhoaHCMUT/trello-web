import { useEffect, useState } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import Reload from '~/customReloadPage/reload'
import { verifyrUserAPI } from '~/apis'

function AccountVerification() {
  // Lấy giá trị email và token từ URL
  let [searchParams] = useSearchParams()
  // const email = searchParams.get('email')
  // const token = searchParams.get('token')
  const { email, token } = Object.fromEntries([...searchParams])

  // Tạo 1 biến state để biết được là đã verify tài khoản thành công hay chưa
  const [verified, setVerified] = useState(false)

  // Gọi API để verify tài khoản
  useEffect(() => {
    if (email && token) {
      verifyrUserAPI({ email, token }).then(() => { setVerified(true) })
    }
  }, [email, token])

  // Nếu URL có vấn đề, không tồn tại 1 trong 2 giá trị email hoặc token thì đá ra trang 404 luôn
  if (!(email && token)) return <Navigate to="/404"/>

  // Nếu chưa verify thì hiện loading
  if (!verified) return <Reload/>

  // Cuối cùng nếu không gặp vấn đề gì + verify thành công thì điều hướng về trang login cùng giá trị verifiedEmail
  return <Navigate to={`/login?verifiedEmail=${email}`}/>
}

export default AccountVerification
