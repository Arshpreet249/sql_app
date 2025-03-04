import React ,{useEffect,useState} from 'react'
import { data } from 'react-router-dom'

const Users = ({onclose}) => {
 

    // useEffect(() => {
    //     let data = JSON.parse(localStorage.getItem("db"))
    //     console.log(data)
    
    //   }, [])
    
    //   useEffect(() => {
    //     let data = JSON.parse(sessionStorage.getItem("db"))
    //     console.log(data)
    //   }, [])

    const hideBox=(e)=> {
        if (infoRef.current === e.target) {
          onclose()
        }

      }
      

    
  return (
    <div onClick={hideBox} >
      <div>
        <div>
          
        </div>
      </div>
    </div>
  )
}

export default Users
