package org.ante.quartz.schedule;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

@Component
public class ReleaseQtyAndUpdateOrderStatusSchedule extends QuartzJobBean {

	private Log log = LogFactory.getLog(this.getClass());
	

	protected void executeInternal(JobExecutionContext arg0)
			throws JobExecutionException {
		log.info("dennis test execute schedule start ");
		try {
			System.out.println("---ReleaseQtyAndUpdateOrderStatusSchedule------");
		} catch (Exception e) {
			e.printStackTrace();
			log.error("execute ReleaseQtyAndUpdateOrderStatus schedule error:"
					+ e.getMessage());
		}
		log.info("dennis test exxcute schedule end");
	}
}