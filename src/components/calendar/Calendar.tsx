import styles from "./Calendar.module.scss";
import { ChevronRightIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import { useCallback, useMemo, useState } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    differenceInCalendarDays,
    getMonth,
    isSaturday,
    isSunday,
} from "date-fns";

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const weekMock = ["일", "월", "화", "수", "목", "금", "토"];
    const nextMonthHandler = useCallback(() => {
        setCurrentDate(addMonths(currentDate, 1));
    }, [currentDate]);
    const prevMonthHandler = useCallback(() => {
        setCurrentDate(subMonths(currentDate, 1));
    }, [currentDate]);
    const createMonth = useMemo(() => {
        const monthArray = [];
        let day = startDate;
        while (differenceInCalendarDays(endDate, day) >= 0) {
            monthArray.push(day);
            day = addDays(day, 1);
        }
        return monthArray;
    }, [currentDate]);
    return (
        <section className={styles.calendar}>
            <div className={styles.yearTitle}>{format(currentDate, "yyyy년")}</div>
            <div className={styles.monthTitle}>
                <button className={styles.prevButton} onClick={prevMonthHandler}>
                    <ChevronLeftIcon />
                </button>
                <div className={styles.month}>{format(currentDate, "M월")}</div>
                <button className={styles.nextButton} onClick={nextMonthHandler}>
                    <ChevronRightIcon />
                </button>
            </div>
            <div className={styles.dayContainer}>
                {weekMock.map((v, i) => {
                    let style;
                    if (i === 0) {
                        style = {
                            color: "red",
                        };
                    } else if (i === 6) {
                        style = {
                            color: "blue",
                        };
                    }

                    return (
                        <div key={`day${i}`} style={style}>
                            {v}
                        </div>
                    );
                })}
            </div>
            <div className={styles.dateContainer}>
                {createMonth.map((v, i) => {
                    let validation;
                    let style;
                    validation = getMonth(currentDate) === getMonth(v);
                    if (validation && isSaturday(v)) {
                        style = {
                            color: "blue",
                        };
                    } else if (validation && isSunday(v)) {
                        style = {
                            color: "red",
                        };
                    }
                    return (
                        <div
                            key={`date${i}`}
                            className={validation ? styles.currentMonth : styles.diffMonth}
                            style={style}
                        >
                            <span>{format(v, "d")}</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Calendar;
