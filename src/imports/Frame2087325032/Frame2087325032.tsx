import svgPaths from "./svg-mcyhvralw8";

function Group1() {
  return (
    <div className="absolute inset-[16.67%]">
      <div className="absolute inset-[-3.13%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
          <g id="Group 47999">
            <path clipRule="evenodd" d={svgPaths.p3467bef0} fillRule="evenodd" id="Vector" stroke="var(--stroke-0, white)" strokeLinejoin="round" strokeOpacity="0.6" />
            <path d={svgPaths.p138ba00} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Component() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="任务列表--未选中">
      <Group1 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <Component />
      <p className="capitalize font-['PingFang_SC:Regular',sans-serif] leading-none not-italic relative shrink-0 text-[16px] text-[rgba(255,255,255,0.6)] text-center whitespace-nowrap">队列</p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute h-[5.143px] left-[4px] top-[7px] w-[12px]">
      <div className="absolute inset-[-16.2%_-6.94%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.6667 6.80954">
          <g id="Group 47665">
            <path d={svgPaths.pe46740} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" strokeWidth="1.66667" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="relative shrink-0 size-[20px]">
      <Group />
    </div>
  );
}

export default function Frame() {
  return (
    <div className="relative rounded-[20px] size-full">
      <div aria-hidden="true" className="absolute backdrop-blur-[20px] bg-[rgba(0,0,0,0.4)] inset-0 pointer-events-none rounded-[20px]" />
      <div className="content-stretch flex gap-[8px] items-center overflow-clip pl-[16px] pr-[20px] py-[8px] relative rounded-[inherit] size-full">
        <Frame1 />
        <Frame2 />
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_12px_0px_rgba(255,255,255,0.25)]" />
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[20px]" />
    </div>
  );
}