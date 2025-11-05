import React from 'react'
import styles from './ImportModal.module.css'

const ImportModal = ({ isOpen, onClose, onImport, processing }) => {
  if (!isOpen) return null

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const result = await onImport(file)
      if (result) {
        alert(`Updated: ${result.updated}\nFailed: ${result.failed}`)
        onClose()
      }
    } catch (error) {
      alert(`Error: ${error.message}`)
    }
    
    e.target.value = ''
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Import Resident Records</h3>
        <p>Upload CSV file with format: resident_id,first_name,last_name,good_standing</p>
        <input 
          type="file" 
          accept=".csv"
          onChange={handleFileChange}
          disabled={processing}
        />
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

export default ImportModal