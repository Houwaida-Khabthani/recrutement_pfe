import React from "react";

interface NotificationCardProps {
  notification: any;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
}) => {
  return (
    <div style={styles.card}>
      <div style={styles.icon}>🔔</div>
      <div>
        <p style={styles.message}>{notification.message}</p>
        <small style={styles.date}>
          {new Date(notification.createdAt).toLocaleDateString()}
        </small>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    marginBottom: "12px",
  },
  icon: {
    fontSize: "20px",
  },
  message: {
    margin: 0,
    fontWeight: 500,
  },
  date: {
    color: "#6b7280",
  },
};

export default NotificationCard;
