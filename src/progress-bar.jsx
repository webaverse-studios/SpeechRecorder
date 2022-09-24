import * as React from "react";
import * as PropTypes from "prop-types";
const ProgressBar = ({
    bgColor,
    completed,
    baseBgColor,
    height,
    width,
    margin,
    padding,
    borderRadius,
    labelAlignment,
    labelColor,
    labelSize,
    isLabelVisible,
    customLabelStyles,
    transitionDuration,
    transitionTimingFunction,
    className,
    dir,
    ariaValuemin,
    ariaValuemax,
    ariaValuetext,
    maxCompleted,
    customLabel,
    animateOnRender,
    barContainerClassName,
    completedClassName,
    labelClassName,
    initCompletedOnAnimation = 0
}) => {
    const getAlignment = (
        alignmentOption
    ) => {
        if (alignmentOption === "left") {
            return "flex-start";
        } else if (alignmentOption === "center") {
            return "center";
        } else if (alignmentOption === "right") {
            return "flex-end";
        } else {
            return null;
        }
    };

    const alignment = getAlignment(labelAlignment);

    const initCompletedOnAnimationStr = typeof initCompletedOnAnimation === "number" ? `${initCompletedOnAnimation}%` : initCompletedOnAnimation;

    const getFillerWidth = (
        maxCompletedValue,
        completedValue
    ) => {
        if (maxCompletedValue) {
            const ratio = Number(completedValue) / maxCompletedValue;
            return ratio > 1 ? "100%" : `${ratio * 100}%`;
        }
        return initCompletedOnAnimationStr;
    };

    const fillerWidth = getFillerWidth(maxCompleted, completed);

    const [initWidth, setInitWidth] = React.useState (initCompletedOnAnimationStr);

    const containerStyles = {
        height: height,
        background: baseBgColor,
        borderRadius: borderRadius,
        padding: padding,
        width: width,
        margin: margin,
    };

    const fillerStyles = {
        height: height,
        width: animateOnRender ? initWidth : fillerWidth,
        background: bgColor,
        transition: `width ${transitionDuration || "1s"} ${transitionTimingFunction || "ease-in-out"
            }`,
        borderRadius: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent:
            labelAlignment !== "outside" && alignment ? alignment : "normal",
    };

    const labelStyles = {
        padding: labelAlignment === "outside" ? "0 0 0 5px" : "5px",
        color: labelColor,
        fontWeight: "bold",
        fontSize: labelSize,
        display: !isLabelVisible ? "none" : "initial",
        ...customLabelStyles
    };

    const outsideStyles = {
        display: labelAlignment === "outside" ? "flex" : "initial",
        alignItems: labelAlignment === "outside" ? "center" : "initial",
    };

    const completedStr =
        typeof completed === "number" ? `${completed}%` : `${completed}`;

    const labelStr = customLabel ? customLabel : completedStr;

    React.useEffect(() => {
        if (animateOnRender) {
            requestAnimationFrame(() => setInitWidth(fillerWidth));
        }
    }, [fillerWidth, animateOnRender]);

    return (
        <div
            style={className ? undefined : outsideStyles}
            className={className}
            dir={dir}
            role="progressbar"
            aria-valuenow={parseFloat(labelStr)}
            aria-valuemin={ariaValuemin}
            aria-valuemax={ariaValuemax}
            aria-valuetext={`${ariaValuetext === null ? labelStr : ariaValuetext}`}
        >
            <div
                style={barContainerClassName ? undefined : containerStyles}
                className={barContainerClassName}
            >
                <div
                    style={completedClassName ? undefined : fillerStyles}
                    className={completedClassName}
                >
                    {labelAlignment !== "outside" && (
                        <span
                            style={labelClassName ? undefined : labelStyles}
                            className={labelClassName}
                        >
                            {labelStr}
                        </span>
                    )}
                </div>
            </div>
            {labelAlignment === "outside" && (
                <span
                    style={labelClassName ? undefined : labelStyles}
                    className={labelClassName}
                >
                    {labelStr}
                </span>
            )}
        </div>
    );
};

ProgressBar.propTypes = {
    completed: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    bgColor: PropTypes.string,
    baseBgColor: PropTypes.string,
    height: PropTypes.string,
    width: PropTypes.string,
    borderRadius: PropTypes.string,
    margin: PropTypes.string,
    padding: PropTypes.string,
    labelAlignment: PropTypes.oneOf(["left", "center", "right", "outside"]),
    labelColor: PropTypes.string,
    labelSize: PropTypes.string,
    isLabelVisible: PropTypes.bool,
    className: PropTypes.string,
    dir: PropTypes.oneOf(["rtl", "ltr", "auto"]),
    maxCompleted: PropTypes.number,
    customLabel: PropTypes.string,
    animateOnRender: PropTypes.bool,
    barContainerClassName: PropTypes.string,
    completedClassName: PropTypes.string,
    labelClassName: PropTypes.string,
    initCompletedOnAnimation: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

ProgressBar.defaultProps = {
    bgColor: "#6a1b9a",
    height: "20px",
    width: "100%",
    borderRadius: "50px",
    labelAlignment: "right",
    baseBgColor: "#e0e0de",
    labelColor: "#fff",
    labelSize: "15px",
    isLabelVisible: true,
    dir: "ltr",
    ariaValuemin: 0,
    ariaValuemax: 100,
    ariaValuetext: null,
    maxCompleted: 100,
    animateOnRender: false,
    initCompletedOnAnimation: 0
};

export default ProgressBar;